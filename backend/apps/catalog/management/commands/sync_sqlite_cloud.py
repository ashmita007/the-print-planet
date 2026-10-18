import io
import os
import ssl
import sqlite3
import logging
import urllib.request
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)

CLOUDINARY_RAW_URL = "https://res.cloudinary.com/pmq4rert/raw/upload/the_print_planet/db_backup.sqlite3"


class Command(BaseCommand):
    help = 'Automatically backs up or restores the SQLite database to/from Cloudinary raw cloud storage.'

    def add_arguments(self, parser):
        parser.add_argument('--restore', action='store_true', help='Restore SQLite database from Cloudinary')
        parser.add_argument('--backup', action='store_true', help='Backup SQLite database to Cloudinary')

    def handle(self, *args, **options):
        db_path = str(settings.BASE_DIR / 'db.sqlite3')

        if options.get('restore'):
            self.restore_database(db_path)
        else:
            self.backup_database(db_path)

    def restore_database(self, db_path):
        """Downloads the persistent SQLite backup from Cloudinary if available."""
        self.stdout.write(self.style.NOTICE("Checking Cloudinary for persistent SQLite backup..."))
        try:
            import certifi
            ctx = ssl.create_default_context(cafile=certifi.where())
        except Exception:
            ctx = ssl.create_default_context()

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
                        # Check local product count
                        existing_prods = 0
                        if os.path.exists(db_path):
                            try:
                                conn = sqlite3.connect(db_path)
                                cur = conn.cursor()
                                cur.execute("SELECT count(*) FROM catalog_product")
                                existing_prods = cur.fetchone()[0]
                                conn.close()
                            except Exception:
                                existing_prods = 0

                        # Check downloaded database product count
                        try:
                            mem_conn = sqlite3.connect(':memory:')
                            if hasattr(mem_conn, 'deserialize'):
                                mem_conn.deserialize(data)
                                cur = mem_conn.cursor()
                                cur.execute("SELECT count(*) FROM catalog_product")
                                remote_prods = cur.fetchone()[0]
                                mem_conn.close()
                                if remote_prods < existing_prods:
                                    self.stdout.write(self.style.WARNING(
                                        f"Preserving local data: local database has {existing_prods} products while cloud backup has only {remote_prods} products."
                                    ))
                                    return False
                        except Exception:
                            pass

                        with open(db_path, 'wb') as f:
                            f.write(data)
                        self.stdout.write(self.style.SUCCESS(f"Successfully restored SQLite database ({len(data)} bytes) from Cloudinary!"))
                        return True
                    else:
                        self.stdout.write(self.style.WARNING("Cloudinary backup is not a valid SQLite database header."))
        except Exception as e:
            self.stdout.write(self.style.NOTICE(f"No existing Cloudinary backup or restore skipped: {e}"))
        return False

    def backup_database(self, db_path):
        """Uploads a live snapshot of the SQLite database to Cloudinary."""
        if not os.path.exists(db_path):
            self.stdout.write(self.style.WARNING("SQLite database file not found."))
            return False

        try:
            import cloudinary
            import cloudinary.uploader
            import urllib.parse

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
