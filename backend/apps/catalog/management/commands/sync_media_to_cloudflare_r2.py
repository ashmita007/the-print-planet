import mimetypes
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.catalog.models import ProductImage


class Command(BaseCommand):
    help = 'Uploads local media assets to Cloudflare R2 and updates ProductImage secure_url references.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Cloudflare R2 Media Sync..."))

        access_key = getattr(settings, 'R2_ACCESS_KEY_ID', '')
        secret_key = getattr(settings, 'R2_SECRET_ACCESS_KEY', '')
        endpoint_url = getattr(settings, 'R2_ENDPOINT_URL', '')
        bucket_name = getattr(settings, 'R2_BUCKET_NAME', '')
        public_url = getattr(settings, 'R2_PUBLIC_URL', '').rstrip('/')

        if not (access_key and secret_key and endpoint_url and bucket_name):
            self.stdout.write(self.style.ERROR(
                "Missing Cloudflare R2 credentials. Please set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, "
                "R2_ENDPOINT_URL, and R2_BUCKET_NAME in your environment."
            ))
            return

        try:
            import boto3
            from botocore.config import Config
        except ImportError:
            self.stdout.write(self.style.ERROR("boto3 is not installed. Run 'pip install boto3'."))
            return

        s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            config=Config(signature_version='s3v4')
        )

        media_products_dir = Path(settings.MEDIA_ROOT) / 'products'
        if not media_products_dir.exists():
            self.stdout.write(self.style.ERROR(f"Directory {media_products_dir} does not exist."))
            return

        files = list(media_products_dir.glob('*.*'))
        self.stdout.write(f"Found {len(files)} files in {media_products_dir}")

        synced = 0
        updated_db = 0

        for file_path in files:
            key = f"products/{file_path.name}"
            content_type, _ = mimetypes.guess_type(str(file_path))
            content_type = content_type or 'application/octet-stream'

            try:
                with open(file_path, 'rb') as f:
                    s3.upload_fileobj(
                        f,
                        bucket_name,
                        key,
                        ExtraArgs={'ContentType': content_type}
                    )
                synced += 1

                # Construct public URL
                if public_url:
                    r2_url = f"{public_url}/{key}"
                else:
                    r2_url = f"{endpoint_url.rstrip('/')}/{bucket_name}/{key}"

                # Update matching ProductImage records
                local_ref = f"/media/products/{file_path.name}"
                matched = ProductImage.objects.filter(secure_url=local_ref)
                for img in matched:
                    img.secure_url = r2_url
                    img.cloudinary_public_id = key
                    img.save()
                    updated_db += 1

                self.stdout.write(f"  ✓ Synced {file_path.name} -> {r2_url}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  ✗ Failed {file_path.name}: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"Sync complete! Synced {synced} files to Cloudflare R2. Updated {updated_db} database records."
        ))
