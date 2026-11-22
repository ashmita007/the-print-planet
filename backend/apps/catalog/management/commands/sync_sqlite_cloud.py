import io
import os
import sys
import ssl
import json
import sqlite3
import logging
import urllib.error
import urllib.request
import urllib.parse
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

logger = logging.getLogger(__name__)

# Backups hold customer data, so they are stored as private Cloudinary files and fetched
# through short-lived signed links. Restore falls back to the legacy public copy only while a
# private copy does not exist yet; legacy public copies are deleted with --purge-public once the
# private copy has been checked.
DB_BACKUP_ID = 'the_print_planet/db_backup.sqlite3'
ENQUIRIES_BACKUP_ID = 'the_print_planet/enquiries_backup.json'


def configure_cloudinary():
    """
    Configure Cloudinary from CLOUDINARY_BACKUP_URL (backups only, so product uploads can stay on
    local disk) or CLOUDINARY_URL. Returns the cloud name.
    """
    import cloudinary
    raw_url = (os.environ.get('CLOUDINARY_BACKUP_URL') or os.environ.get('CLOUDINARY_URL')
               or getattr(settings, 'CLOUDINARY_URL', ''))
    parsed = urllib.parse.urlparse(raw_url or '')
    if not (parsed.hostname and parsed.username and parsed.password):
        raise RuntimeError('Set CLOUDINARY_BACKUP_URL (cloudinary://key:secret@cloud) to use cloud backups.')
    cloudinary.config(cloud_name=parsed.hostname, api_key=parsed.username, api_secret=parsed.password, secure=True)
    return parsed.hostname


def private_backup_url(public_id):
    """Signed, short-lived download link for a private raw backup."""
    import cloudinary.utils
    configure_cloudinary()
    return cloudinary.utils.private_download_url(public_id, '', resource_type='raw', type='private')


def fetch_backup(public_id, ctx, timeout):
    """Bytes of the private backup, or of the legacy public copy when no private copy exists yet."""
    headers = {'User-Agent': 'ThePrintPlanet/1.0', 'Cache-Control': 'no-cache'}
    try:
        req = urllib.request.Request(private_backup_url(public_id), headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        if exc.code != 404:
            raise
    legacy = f'https://res.cloudinary.com/{configure_cloudinary()}/raw/upload/{public_id}'
    with urllib.request.urlopen(urllib.request.Request(legacy, headers=headers), context=ctx, timeout=timeout) as response:
        return response.read()


def upload_private_backup(data, public_id):
    import cloudinary.uploader
    configure_cloudinary()
    cloudinary.uploader.upload(data, resource_type='raw', type='private', public_id=public_id, overwrite=True)


def cloud_sync_allowed():
    """
    Cloud backup/restore talks to the ONE file production restores from on every start, so it may only
    run on the production server. A laptop or a test run uploading its own database there replaces the
    live shop's data on the next deploy (this happened on 13 Nov 2026).

    Allowed when running on Render (it sets RENDER=true and RENDER_SERVICE_ID on every service), or when
    CLOUD_BACKUP_ENABLED=true is set explicitly. Never during tests or when CLOUD_BACKUP_ENABLED=false.
    """
    flag = os.environ.get('CLOUD_BACKUP_ENABLED', '').strip().lower()
    if flag in ('0', 'false', 'no', 'off'):
        return False
    if getattr(settings, 'TESTING', False) or (len(sys.argv) > 1 and sys.argv[1] == 'test'):
        return False
    if flag in ('1', 'true', 'yes', 'on'):
        return True
    return os.environ.get('RENDER', '').lower() == 'true' or bool(os.environ.get('RENDER_SERVICE_ID'))


class Command(BaseCommand):
    help = 'Automatically backs up or restores the SQLite database and customer enquiries to/from Cloudinary raw cloud storage.'

    def add_arguments(self, parser):
        parser.add_argument('--restore', action='store_true', help='Restore SQLite database and enquiries from Cloudinary')
        parser.add_argument('--backup', action='store_true', help='Backup SQLite database and enquiries to Cloudinary')
        parser.add_argument('--force', action='store_true',
                            help='Run even off the production server (only to deliberately restore or seed production).')
        parser.add_argument('--purge-public', action='store_true',
                            help='Delete the legacy public backup copies once the private copies hold the real data.')

    def handle(self, *args, **options):
        db = settings.DATABASES['default']
        db_path = str(db['NAME'] if db['ENGINE'].endswith('sqlite3') else settings.BASE_DIR / 'db.sqlite3')

        if not options.get('force') and not cloud_sync_allowed():
            self.stdout.write(self.style.WARNING(
                "Cloud sync skipped: not running on the production server. "
                "Pass --force only if you really mean to overwrite the production backup."
            ))
            return

        if options.get('purge_public'):
            self.purge_public_copies()
        elif options.get('restore'):
            self.restore_database(db_path)
            self.restore_enquiries_json()
        else:
            self.backup_database(db_path)
            self.backup_enquiries_json()

    def purge_public_copies(self):
        """Delete legacy public backups, but only after checking the private DB backup is a real database."""
        import tempfile
        import cloudinary.uploader
        try:
            import certifi
            ctx = ssl.create_default_context(cafile=certifi.where())
        except ImportError:
            ctx = ssl.create_default_context()
        with urllib.request.urlopen(urllib.request.Request(private_backup_url(DB_BACKUP_ID)), context=ctx, timeout=30) as response:
            data = response.read()
        if data[:16] != b'SQLite format 3\x00':
            raise CommandError('Private DB backup is not a SQLite database; public copies kept.')
        with tempfile.NamedTemporaryFile(suffix='.sqlite3') as tmp:
            tmp.write(data)
            tmp.flush()
            conn = sqlite3.connect(tmp.name)
            try:
                products = conn.execute('SELECT count(*) FROM catalog_product').fetchone()[0]
            finally:
                conn.close()
        if products == 0:
            raise CommandError('Private DB backup has no products; public copies kept.')
        for public_id in (DB_BACKUP_ID, ENQUIRIES_BACKUP_ID):
            result = cloudinary.uploader.destroy(public_id, resource_type='raw', type='upload', invalidate=True)
            self.stdout.write(f"{public_id}: {result.get('result')}")
        self.stdout.write(self.style.SUCCESS(f'Private backup verified ({products} products); public copies removed.'))

    def restore_database(self, db_path):
        """Downloads the persistent SQLite backup from Cloudinary while strictly preserving existing enquiries."""
        self.stdout.write(self.style.NOTICE("Checking Cloudinary for persistent SQLite backup..."))
        try:
            import certifi
            ctx = ssl.create_default_context(cafile=certifi.where())
        except Exception:
            ctx = ssl.create_default_context()

        # Step A: Preserve any enquiries currently in local SQLite database
        local_enquiries = []
        existing_prods = 0
        if os.path.exists(db_path):
            try:
                conn = sqlite3.connect(db_path)
                cur = conn.cursor()
                try:
                    cur.execute("SELECT count(*) FROM catalog_product")
                    existing_prods = cur.fetchone()[0]
                except Exception:
                    existing_prods = 0

                try:
                    cur.execute("SELECT id, full_name, company_name, email, phone, product_id, product_name_text, requested_quantity, message, source_page, status, admin_notes, created_at, updated_at FROM enquiries_enquiry")
                    local_enquiries = cur.fetchall()
                except Exception:
                    local_enquiries = []
                conn.close()
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Could not inspect local database prior to restore: {e}"))

        try:
            data = fetch_backup(DB_BACKUP_ID, ctx, timeout=12)
            if len(data) > 1000 and data[:16] == b'SQLite format 3\x00':
                # Verify remote product count using safe tempfile verification
                import tempfile
                remote_prods = 0
                try:
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.sqlite3') as tmp:
                        tmp.write(data)
                        tmp_path = tmp.name
                    tmp_conn = sqlite3.connect(tmp_path)
                    cur = tmp_conn.cursor()
                    cur.execute("SELECT count(*) FROM catalog_product")
                    remote_prods = cur.fetchone()[0]
                    tmp_conn.close()
                    os.remove(tmp_path)
                except Exception as check_err:
                    self.stdout.write(self.style.WARNING(f"Could not verify remote database product count: {check_err}"))

                if existing_prods > 0 and remote_prods < existing_prods:
                    self.stdout.write(self.style.WARNING(
                        f"Preserving local data: local database has {existing_prods} products while cloud backup has only {remote_prods} products."
                    ))
                    return False

                with open(db_path, 'wb') as f:
                    f.write(data)
                self.stdout.write(self.style.SUCCESS(f"Successfully restored SQLite database ({len(data)} bytes) from Cloudinary!"))

                # Step B: Re-merge local enquiries into the newly restored database
                if local_enquiries:
                    try:
                        conn = sqlite3.connect(db_path)
                        cur = conn.cursor()
                        re_inserted = 0
                        for enq in local_enquiries:
                            try:
                                cur.execute(
                                    "INSERT OR IGNORE INTO enquiries_enquiry (id, full_name, company_name, email, phone, product_id, product_name_text, requested_quantity, message, source_page, status, admin_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                    enq
                                )
                                if cur.rowcount > 0:
                                    re_inserted += 1
                            except Exception:
                                pass
                        conn.commit()
                        conn.close()
                        if re_inserted > 0:
                            self.stdout.write(self.style.SUCCESS(f"Preserved and merged {re_inserted} local customer enquiries into restored database!"))
                    except Exception as merge_err:
                        self.stdout.write(self.style.WARNING(f"Could not re-merge local enquiries: {merge_err}"))

                return True
            else:
                self.stdout.write(self.style.WARNING("Cloudinary backup is not a valid SQLite database header."))
        except Exception as e:
            self.stdout.write(self.style.NOTICE(f"No existing Cloudinary backup or restore skipped: {e}"))
        return False

    def restore_enquiries_json(self):
        """Restores and merges customer enquiries from Cloudinary JSON fixture into SQLite."""
        try:
            try:
                import certifi
                ctx = ssl.create_default_context(cafile=certifi.where())
            except Exception:
                ctx = ssl.create_default_context()

            raw = fetch_backup(ENQUIRIES_BACKUP_ID, ctx, timeout=10).decode('utf-8')
            enquiries_list = json.loads(raw)
            if isinstance(enquiries_list, list) and len(enquiries_list) > 0:
                from apps.enquiries.models import Enquiry
                merged_count = 0
                for item in enquiries_list:
                    obj, created = Enquiry.objects.get_or_create(
                        id=item.get('id'),
                        defaults={
                            'full_name': item.get('full_name', ''),
                            'company_name': item.get('company_name', ''),
                            'email': item.get('email', ''),
                            'phone': item.get('phone', ''),
                            'product_id': item.get('product_id'),
                            'product_name_text': item.get('product_name_text', ''),
                            'requested_quantity': item.get('requested_quantity'),
                            'message': item.get('message', ''),
                            'source_page': item.get('source_page', ''),
                            'status': item.get('status', 'new'),
                            'admin_notes': item.get('admin_notes', ''),
                        }
                    )
                    if created:
                        merged_count += 1
                if merged_count > 0:
                    self.stdout.write(self.style.SUCCESS(f"Merged {merged_count} historical enquiries from Cloudinary JSON storage!"))
        except Exception as e:
            self.stdout.write(self.style.NOTICE(f"Enquiries JSON cloud restore skipped: {e}"))

    def backup_database(self, db_path):
        """Uploads a live snapshot of the SQLite database to Cloudinary."""
        if not os.path.exists(db_path):
            self.stdout.write(self.style.WARNING("SQLite database file not found."))
            return False

        try:

            # Perform safe online backup from live db to memory to prevent file lock corruption
            src_conn = sqlite3.connect(db_path)
            dst_conn = sqlite3.connect(':memory:')
            src_conn.backup(dst_conn)
            src_conn.close()

            if hasattr(dst_conn, 'serialize'):
                backup_bytes = dst_conn.serialize()
            else:
                backup_bytes = open(db_path, 'rb').read()
            dst_conn.close()

            upload_private_backup(backup_bytes, DB_BACKUP_ID)
            self.stdout.write(self.style.SUCCESS(f"Successfully backed up SQLite database ({len(backup_bytes)} bytes) to Cloudinary!"))
            return True
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to backup SQLite to Cloudinary: {e}"))
            return False

    def backup_enquiries_json(self):
        """Exports all enquiries to an independent, non-destructible Cloudinary JSON file."""
        try:
            from apps.enquiries.models import Enquiry

            enquiries = list(Enquiry.objects.all().order_by('id'))
            data = []
            for e in enquiries:
                data.append({
                    'id': e.id,
                    'full_name': e.full_name,
                    'company_name': e.company_name,
                    'email': e.email,
                    'phone': e.phone,
                    'product_id': e.product_id,
                    'product_name_text': e.product_name_text,
                    'requested_quantity': e.requested_quantity,
                    'message': e.message,
                    'source_page': e.source_page,
                    'status': e.status,
                    'admin_notes': e.admin_notes,
                    'created_at': e.created_at.isoformat() if e.created_at else None,
                    'updated_at': e.updated_at.isoformat() if e.updated_at else None,
                })

            json_bytes = json.dumps(data, indent=2).encode('utf-8')
            upload_private_backup(json_bytes, ENQUIRIES_BACKUP_ID)
            self.stdout.write(self.style.SUCCESS(f"Saved {len(data)} enquiries to Cloudinary enquiries_backup.json!"))
            return True
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Could not backup enquiries JSON to Cloudinary: {e}"))
            return False
