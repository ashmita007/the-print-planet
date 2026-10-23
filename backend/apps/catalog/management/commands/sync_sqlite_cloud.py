import io
import os
import ssl
import json
import sqlite3
import logging
import urllib.request
import urllib.parse
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)

CLOUDINARY_RAW_URL = "https://res.cloudinary.com/pmq4rert/raw/upload/the_print_planet/db_backup.sqlite3"
CLOUDINARY_ENQUIRIES_URL = "https://res.cloudinary.com/pmq4rert/raw/upload/the_print_planet/enquiries_backup.json"


class Command(BaseCommand):
    help = 'Automatically backs up or restores the SQLite database and customer enquiries to/from Cloudinary raw cloud storage.'

    def add_arguments(self, parser):
        parser.add_argument('--restore', action='store_true', help='Restore SQLite database and enquiries from Cloudinary')
        parser.add_argument('--backup', action='store_true', help='Backup SQLite database and enquiries to Cloudinary')

    def handle(self, *args, **options):
        db_path = str(settings.BASE_DIR / 'db.sqlite3')

        if options.get('restore'):
            self.restore_database(db_path)
            self.restore_enquiries_json()
        else:
            self.backup_database(db_path)
            self.backup_enquiries_json()

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
            import time
            cache_busted_url = f"{CLOUDINARY_RAW_URL}?t={int(time.time())}"
            req = urllib.request.Request(
                cache_busted_url,
                headers={
                    'User-Agent': 'ThePrintPlanet/1.0',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                }
            )
            with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
                if response.status == 200:
                    data = response.read()
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
            import time
            try:
                import certifi
                ctx = ssl.create_default_context(cafile=certifi.where())
            except Exception:
                ctx = ssl.create_default_context()

            cache_busted_url = f"{CLOUDINARY_ENQUIRIES_URL}?t={int(time.time())}"
            req = urllib.request.Request(
                cache_busted_url,
                headers={
                    'User-Agent': 'ThePrintPlanet/1.0',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                }
            )
            with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                if response.status == 200:
                    raw = response.read().decode('utf-8')
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
            import cloudinary
            import cloudinary.uploader

            raw_url = os.environ.get('CLOUDINARY_URL') or getattr(settings, 'CLOUDINARY_URL', '')
            if not raw_url:
                raw_url = "cloudinary://496388753899233:NFgWJvwr_prZlSHy9ppt7g55aX0@pmq4rert"

            parsed = urllib.parse.urlparse(raw_url)
            cloudinary.config(
                cloud_name=parsed.hostname or getattr(settings, 'CLOUDINARY_CLOUD_NAME', 'pmq4rert'),
                api_key=parsed.username or getattr(settings, 'CLOUDINARY_API_KEY', '496388753899233'),
                api_secret=parsed.password or getattr(settings, 'CLOUDINARY_API_SECRET', 'NFgWJvwr_prZlSHy9ppt7g55aX0'),
                secure=True
            )

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

            res = cloudinary.uploader.upload(
                backup_bytes,
                resource_type='raw',
                public_id='the_print_planet/db_backup.sqlite3',
                overwrite=True,
                invalidate=True
            )
            self.stdout.write(self.style.SUCCESS(f"Successfully backed up SQLite database ({len(backup_bytes)} bytes) to Cloudinary!"))
            return True
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to backup SQLite to Cloudinary: {e}"))
            return False

    def backup_enquiries_json(self):
        """Exports all enquiries to an independent, non-destructible Cloudinary JSON file."""
        try:
            import cloudinary
            import cloudinary.uploader
            from apps.enquiries.models import Enquiry

            raw_url = os.environ.get('CLOUDINARY_URL') or getattr(settings, 'CLOUDINARY_URL', '')
            if not raw_url:
                raw_url = "cloudinary://496388753899233:NFgWJvwr_prZlSHy9ppt7g55aX0@pmq4rert"

            parsed = urllib.parse.urlparse(raw_url)
            cloudinary.config(
                cloud_name=parsed.hostname or getattr(settings, 'CLOUDINARY_CLOUD_NAME', 'pmq4rert'),
                api_key=parsed.username or getattr(settings, 'CLOUDINARY_API_KEY', '496388753899233'),
                api_secret=parsed.password or getattr(settings, 'CLOUDINARY_API_SECRET', 'NFgWJvwr_prZlSHy9ppt7g55aX0'),
                secure=True
            )

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
            cloudinary.uploader.upload(
                json_bytes,
                resource_type='raw',
                public_id='the_print_planet/enquiries_backup.json',
                overwrite=True,
                invalidate=True
            )
            self.stdout.write(self.style.SUCCESS(f"Saved {len(data)} enquiries to Cloudinary enquiries_backup.json!"))
            return True
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Could not backup enquiries JSON to Cloudinary: {e}"))
            return False
