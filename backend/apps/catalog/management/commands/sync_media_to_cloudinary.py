import os
import logging
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.catalog.models import ProductImage, Category

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Scan local media files and upload them to Cloudinary, updating database records with live CDN URLs."

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-upload and overwrite images even if they already have Cloudinary URLs.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate scan and report files without performing actual Cloudinary uploads.',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        dry_run = options.get('dry_run', False)

        self.stdout.write(self.style.NOTICE("Checking Cloudinary configuration..."))

        # Verify Cloudinary configuration
        if not (settings.CLOUDINARY_URL or (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET)):
            self.stdout.write(self.style.ERROR(
                "Cloudinary credentials not detected! Please configure CLOUDINARY_URL or "
                "(CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in environment."
            ))
            return

        try:
            import cloudinary
            import cloudinary.uploader
        except ImportError:
            self.stdout.write(self.style.ERROR("The 'cloudinary' package is not installed."))
            return

        self.stdout.write(self.style.SUCCESS(f"Cloudinary initialized for cloud: {settings.CLOUDINARY_CLOUD_NAME or 'URL-configured'}"))

        media_root = Path(settings.MEDIA_ROOT)
        images = ProductImage.objects.select_related('product').all()
        total_images = images.count()

        self.stdout.write(f"Found {total_images} ProductImage records to inspect...")

        uploaded_count = 0
        skipped_count = 0
        missing_count = 0

        for img in images:
            current_url = img.secure_url or ""
            is_already_cloudinary = "res.cloudinary.com" in current_url

            if is_already_cloudinary and not force:
                skipped_count += 1
                continue

            # Determine local file path
            local_rel = current_url
            if local_rel.startswith('/media/'):
                local_rel = local_rel[len('/media/'):]
            elif local_rel.startswith('media/'):
                local_rel = local_rel[len('media/'):]

            candidate_paths = [
                media_root / local_rel,
                media_root / "products" / Path(local_rel).name,
                media_root / Path(local_rel).name,
            ]

            found_path = None
            for cp in candidate_paths:
                if cp.exists() and cp.is_file():
                    found_path = cp
                    break

            if not found_path:
                self.stdout.write(self.style.WARNING(f"  [MISSING] Image file for {img.product.name} (SKU: {img.product.sku}) not found locally: {current_url}"))
                missing_count += 1
                continue

            if dry_run:
                self.stdout.write(self.style.NOTICE(f"  [DRY-RUN] Would upload {found_path.name} to Cloudinary folder the_print_planet/products"))
                uploaded_count += 1
                continue

            try:
                self.stdout.write(f"  Uploading {found_path.name} for {img.product.sku}...")
                upload_res = cloudinary.uploader.upload(
                    str(found_path),
                    folder="the_print_planet/products",
                    resource_type="image",
                    use_filename=True,
                    unique_filename=True,
                    overwrite=force,
                )
                cdn_url = upload_res.get('secure_url')
                public_id = upload_res.get('public_id')

                img.secure_url = cdn_url
                img.cloudinary_public_id = public_id
                img.save(update_fields=['secure_url', 'cloudinary_public_id'])

                self.stdout.write(self.style.SUCCESS(f"    -> Uploaded: {cdn_url}"))
                uploaded_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"    -> Upload failed for {found_path.name}: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nSync Complete! Uploaded: {uploaded_count}, Skipped (Already on CDN): {skipped_count}, Missing local files: {missing_count}."
        ))
