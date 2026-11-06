import os
import io
import re
import ssl
import logging
import urllib.request
import concurrent.futures
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.catalog.models import ProductImage, Product
from PIL import Image, ImageDraw

import cloudinary
import cloudinary.uploader

logger = logging.getLogger(__name__)

# Cloudinary configuration
cloudinary.config(
    cloud_name='pmq4rert',
    api_key='496388753899233',
    api_secret='NFgWJvwr_prZlSHy9ppt7g55aX0',
    secure=True
)

class Command(BaseCommand):
    help = "Detect and replace Delta Industry logos in product images with The Print Planet official logo, and upload to Cloudinary."

    def add_arguments(self, parser):
        parser.add_argument('--workers', type=int, default=8, help='Number of concurrent workers')
        parser.add_argument('--dry-run', action='store_true', help='Scan and report without uploading or saving')

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        workers = options.get('workers', 8)

        base_dir = Path(settings.BASE_DIR)
        frontend_logo_path = base_dir.parent / 'frontend' / 'public' / 'logo.png'
        if not frontend_logo_path.exists():
            self.stdout.write(self.style.ERROR(f"Official logo not found at {frontend_logo_path}"))
            return

        print_planet_logo = Image.open(frontend_logo_path).convert('RGBA')
        self.stdout.write(self.style.SUCCESS(f"Loaded official logo from {frontend_logo_path} (size: {print_planet_logo.size})"))

        media_products_dir = base_dir / 'media' / 'products'
        media_products_dir.mkdir(parents=True, exist_ok=True)

        images = list(ProductImage.objects.select_related('product').all())
        self.stdout.write(f"Scanning {len(images)} ProductImage records...")

        ctx = ssl._create_unverified_context()

        # Step 1: Detect which images need branding replacement
        to_process = []
        for img in images:
            url = img.secure_url or ""
            if not url or "placeholder" in url:
                continue

            # Check local cached file or download
            slug = img.product.slug or f"prod-{img.product.id}"
            local_cached = f"/tmp/delta_inspect/all_images/{img.id}_{slug}.jpg"
            if not os.path.exists(local_cached):
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    data = urllib.request.urlopen(req, context=ctx, timeout=10).read()
                    with open(local_cached, 'wb') as f:
                        f.write(data)
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Failed to fetch {url}: {e}"))
                    continue

            try:
                im = Image.open(local_cached).convert('RGB')
                w, h = im.size
                header_crop = im.crop((0, 0, int(w * 0.65), int(h * 0.12)))
                pixels = list(header_crop.getdata())
                total_px = len(pixels)

                blue_wedge = sum(1 for (r, g, b) in pixels if b > 140 and r < 70 and g > 80)
                navy_text = sum(1 for (r, g, b) in pixels if 5 <= r <= 50 and 25 <= g <= 75 and 80 <= b <= 160)
                white_px = sum(1 for (r, g, b) in pixels if r > 240 and g > 240 and b > 240)

                has_delta = (blue_wedge > 50 or navy_text > 80) and (white_px / total_px > 0.20)
                if has_delta:
                    to_process.append((img, local_cached, w, h))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error inspecting {local_cached}: {e}"))

        self.stdout.write(self.style.NOTICE(f"Identified {len(to_process)} product images containing Delta Industry logo."))

        if dry_run:
            self.stdout.write(self.style.SUCCESS("Dry run completed. No files modified."))
            return

        # Step 2: Replace logo and upload
        def process_image(item):
            img_obj, local_path, w, h = item
            prod_slug = img_obj.product.slug or f"product-{img_obj.product.id}"
            try:
                im = Image.open(local_path).convert('RGB')
                header_h = int(h * 0.12)
                header_w = int(w * 0.67)

                # Clear Delta logo zone to pure white
                draw = ImageDraw.Draw(im)
                draw.rectangle([0, 0, header_w, header_h], fill=(255, 255, 255))

                # Scale The Print Planet official logo
                target_h = int(header_h * 0.75)
                logo_w = int(print_planet_logo.width * (target_h / print_planet_logo.height))
                scaled_logo = print_planet_logo.resize((logo_w, target_h), Image.Resampling.LANCZOS)

                # Paste scaled logo
                pos_x = int(w * 0.03)
                pos_y = int((header_h - target_h) / 2)
                im.paste(scaled_logo, (pos_x, pos_y), scaled_logo)

                # Save local cleaned copy
                cleaned_filename = f"tpp_{prod_slug}_{img_obj.id}.jpg"
                local_cleaned_path = media_products_dir / cleaned_filename
                im.save(local_cleaned_path, "JPEG", quality=95, optimize=True)

                # Upload to Cloudinary with explicit public_id
                public_id = f"the_print_planet/products/tpp_{prod_slug}_{img_obj.id}"
                upload_res = cloudinary.uploader.upload(
                    str(local_cleaned_path),
                    folder='the_print_planet/products',
                    public_id=f"tpp_{prod_slug}_{img_obj.id}",
                    overwrite=True,
                    invalidate=True,
                    resource_type='image'
                )

                new_url = upload_res.get('secure_url')
                if new_url:
                    img_obj.secure_url = new_url
                    img_obj.save(update_fields=['secure_url'])

                # Update reference_source_url on product if it mentions delta
                prod = img_obj.product
                if prod.reference_source_url and 'delta' in prod.reference_source_url.lower():
                    prod.reference_source_url = f"https://theprintplanet.co.in/products/{prod.slug}"
                    prod.save(update_fields=['reference_source_url'])

                return (True, img_obj.id, prod.name, new_url)
            except Exception as e:
                return (False, img_obj.id, str(e), None)

        self.stdout.write(f"Starting processing with {workers} workers...")
        successful = 0
        failed = 0

        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            futures = [executor.submit(process_image, item) for item in to_process]
            for future in concurrent.futures.as_completed(futures):
                ok, img_id, info, new_url = future.result()
                if ok:
                    successful += 1
                    self.stdout.write(self.style.SUCCESS(f"[{successful}/{len(to_process)}] Rebranded img {img_id}: {info} -> {new_url}"))
                else:
                    failed += 1
                    self.stdout.write(self.style.ERROR(f"Failed img {img_id}: {info}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nRebranding Complete! Successfully updated {successful} images on Cloudinary and in database ({failed} failed)."
        ))
