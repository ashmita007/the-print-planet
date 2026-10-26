import json
import csv
from django.core.management.base import BaseCommand
from apps.catalog.models import ProductImage, Category, Product


class Command(BaseCommand):
    help = "Export all image URLs from the database (ProductImage and Category) into JSON, CSV, or console output."

    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            type=str,
            choices=['text', 'json', 'csv'],
            default='text',
            help='Output format: text (default), json, or csv.'
        )
        parser.add_argument(
            '--output',
            type=str,
            default='',
            help='Path to file to save results (optional). If omitted, prints to console.'
        )

    def handle(self, *args, **options):
        output_format = options.get('format', 'text')
        output_file = options.get('output', '')

        images = ProductImage.objects.select_related('product', 'product__category').order_by('product__id', 'display_order')
        categories = Category.objects.exclude(image__isnull=True).exclude(image='')

        product_image_records = []
        for img in images:
            product_image_records.append({
                "type": "product_image",
                "product_id": img.product.id,
                "product_name": img.product.name,
                "sku": img.product.sku,
                "category": img.product.category.name if img.product.category else "",
                "is_primary": img.is_primary,
                "secure_url": img.secure_url,
                "cloudinary_public_id": img.cloudinary_public_id,
            })

        category_image_records = []
        for cat in categories:
            category_image_records.append({
                "type": "category_image",
                "category_id": cat.id,
                "category_name": cat.name,
                "category_slug": cat.slug,
                "image_url": cat.image,
            })

        all_urls = [r["secure_url"] for r in product_image_records if r["secure_url"]] + [c["image_url"] for c in category_image_records if c["image_url"]]

        if output_format == 'json':
            data = {
                "total_urls": len(all_urls),
                "product_images_count": len(product_image_records),
                "category_images_count": len(category_image_records),
                "urls": all_urls,
                "product_images": product_image_records,
                "category_images": category_image_records,
            }
            json_str = json.dumps(data, indent=2)
            if output_file:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(json_str)
                self.stdout.write(self.style.SUCCESS(f"Saved {len(all_urls)} image URLs to {output_file}"))
            else:
                self.stdout.write(json_str)
            return

        if output_format == 'csv':
            rows = []
            for r in product_image_records:
                rows.append([r["type"], r["sku"], r["product_name"], r["is_primary"], r["secure_url"], r["cloudinary_public_id"]])
            for c in category_image_records:
                rows.append([c["type"], c["category_slug"], c["category_name"], True, c["image_url"], ""])

            header = ["Type", "Identifier", "Name", "Is_Primary", "URL", "Cloudinary_ID"]
            if output_file:
                with open(output_file, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(header)
                    writer.writerows(rows)
                self.stdout.write(self.style.SUCCESS(f"Saved {len(rows)} image URLs to {output_file}"))
            else:
                writer = csv.writer(self.stdout)
                writer.writerow(header)
                writer.writerows(rows)
            return

        # Default text format
        self.stdout.write(self.style.NOTICE(f"=== Found {len(all_urls)} Total Image URLs in Database ==="))
        self.stdout.write(f"\n--- Product Images ({len(product_image_records)}) ---")
        for r in product_image_records:
            primary_tag = "[PRIMARY]" if r["is_primary"] else "         "
            self.stdout.write(f"{primary_tag} [{r['sku']}] {r['product_name']}: {r['secure_url']}")

        if category_image_records:
            self.stdout.write(f"\n--- Category Images ({len(category_image_records)}) ---")
            for c in category_image_records:
                self.stdout.write(f"[{c['category_slug']}] {c['category_name']}: {c['image_url']}")
