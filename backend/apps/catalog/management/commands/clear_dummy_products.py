import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.catalog.models import Product, ProductImage, Category
from apps.catalog.management.commands.backup_database_email import generate_full_database_excel_bytes

class Command(BaseCommand):
    help = 'Safely clears dummy/mock products before client production launch, after generating an automatic safety backup.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate deletion without committing changes to the database.',
        )
        parser.add_argument(
            '--include-categories',
            action='store_true',
            help='Also delete all categories (not recommended; defaults to false).',
        )
        parser.add_argument(
            '--no-backup',
            action='store_true',
            help='Skip creating automatic pre-wipe Excel backup.',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run')
        include_categories = options.get('include_categories')
        skip_backup = options.get('no_backup')

        product_count = Product.objects.count()
        image_count = ProductImage.objects.count()
        category_count = Category.objects.count()

        self.stdout.write(self.style.WARNING("=" * 60))
        self.stdout.write(self.style.WARNING("THE PRINT PLANET - CATALOG PRE-LAUNCH CLEANUP UTILITY"))
        self.stdout.write(self.style.WARNING("=" * 60))
        self.stdout.write(f"Current Database State:")
        self.stdout.write(f"  • Products: {product_count}")
        self.stdout.write(f"  • Product Images: {image_count}")
        self.stdout.write(f"  • Categories: {category_count}")

        if dry_run:
            self.stdout.write(self.style.NOTICE("\n[DRY RUN MODE] No data will be deleted."))
            self.stdout.write(f"Would delete {product_count} products and {image_count} product images.")
            if include_categories:
                self.stdout.write(f"Would also delete {category_count} categories.")
            else:
                self.stdout.write(f"Categories ({category_count}) would be preserved for clean catalog entry.")
            return

        if not skip_backup:
            self.stdout.write("\nGenerating automatic safety database backup before cleanup...")
            try:
                excel_bytes = generate_full_database_excel_bytes()
                backup_dir = os.path.join(settings.BASE_DIR, '..', 'data', 'backups')
                os.makedirs(backup_dir, exist_ok=True)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                backup_path = os.path.join(backup_dir, f"Pre_Wipe_DB_Backup_{timestamp}.xlsx")
                with open(backup_path, 'wb') as f:
                    f.write(excel_bytes)
                self.stdout.write(self.style.SUCCESS(f"✓ Safety backup saved to: {backup_path} ({round(len(excel_bytes)/1024, 1)} KB)"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Warning: Failed to create local safety backup: {e}"))

        # Delete images & products
        self.stdout.write("\nWiping mock/dummy products...")
        deleted_images, _ = ProductImage.objects.all().delete()
        deleted_products, _ = Product.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(f"✓ Successfully deleted {deleted_products} products."))
        self.stdout.write(self.style.SUCCESS(f"✓ Successfully cleared {deleted_images} product images."))

        if include_categories:
            deleted_cats, _ = Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f"✓ Successfully deleted {deleted_cats} categories."))
        else:
            self.stdout.write(self.style.NOTICE(f"✓ Preserved all {category_count} categories for easy product creation by client."))

        self.stdout.write(self.style.SUCCESS("\n[COMPLETED] Database is clean and ready for client production onboarding!"))
