import json
import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.catalog.models import Category, Product, ProductImage
from apps.settings_app.models import SiteSettings, HomePageSection


class Command(BaseCommand):
    help = 'Seeds database with verified reference products, categories, site settings, and homepage sections.'

    def add_arguments(self, parser):
        parser.add_argument('--create-owner', action='store_true', help='Create default owner account if not exists')
        parser.add_argument('--download-images', action='store_true', help='Download remote reference images into local media/products directory')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting database seeding..."))

        # Find reference-products.json
        candidate_paths = [
            Path(__file__).resolve().parent.parent.parent.parent.parent / 'data' / 'reference-products.json',
            Path(__file__).resolve().parent.parent.parent.parent / 'data' / 'reference-products.json',
            Path('/Users/kashinath/Desktop/the_print_planet/data/reference-products.json'),
            Path('/app/data/reference-products.json'),
        ]
        json_path = None
        for p in candidate_paths:
            if p.exists():
                json_path = p
                break

        if not json_path:
            self.stdout.write(self.style.ERROR(f"Data file not found in candidates: {[str(p) for p in candidate_paths]}"))
            return

        with open(json_path, 'r', encoding='utf-8') as f:
            catalog_data = json.load(f)

        categories_data = catalog_data.get('categories', [])
        products_data = catalog_data.get('products', [])

        # 1. Seed Categories
        category_map = {}
        for cat in categories_data:
            cat_obj, created = Category.objects.update_or_create(
                slug=cat['slug'],
                defaults={
                    'name': cat['name'],
                    'description': cat.get('description', ''),
                    'display_order': cat.get('display_order', 0),
                    'is_active': True,
                    'seo_title': f"{cat['name']} - Wholesale ID Supplies | The Print Planet",
                    'seo_description': f"Buy {cat['name']} in bulk. High quality industrial materials, competitive trade prices.",
                }
            )
            category_map[cat['slug']] = cat_obj
            status_text = "Created" if created else "Updated"
            self.stdout.write(f"  Category: {cat['name']} [{status_text}]")

        # 2. Seed Products
        products_created = 0
        products_updated = 0
        # Prepare local media products directory
        from django.conf import settings as dj_settings
        media_products_dir = Path(dj_settings.MEDIA_ROOT) / 'products'
        media_products_dir.mkdir(parents=True, exist_ok=True)

        for p in products_data:
            cat_obj = category_map.get(p['category_slug'])
            if not cat_obj:
                cat_obj, _ = Category.objects.get_or_create(
                    slug=p['category_slug'],
                    defaults={'name': p['category_name']}
                )
                category_map[p['category_slug']] = cat_obj

            base_slug = p['slug']
            slug = base_slug
            idx = 1
            while Product.objects.filter(slug=slug).exclude(sku=p['sku']).exists():
                slug = f"{base_slug}-{idx}"
                idx += 1

            prod_obj, created = Product.objects.update_or_create(
                sku=p['sku'],
                defaults={
                    'name': p['name'],
                    'slug': slug,
                    'category': cat_obj,
                    'short_description': p.get('short_description', ''),
                    'description': p.get('description', ''),
                    'specifications': p.get('specs', {}),
                    'material': p.get('material'),
                    'dimensions': p.get('dimensions'),
                    'color': p.get('color'),
                    'minimum_order_quantity': p.get('minimum_order_quantity'),
                    'price': p.get('price'),
                    'price_display': p.get('price_display'),
                    'currency': p.get('currency', 'INR'),
                    'is_featured': p.get('is_featured', False),
                    'is_active': True,
                    'reference_source_url': p.get('url'),
                    'verification_status': p.get('verification_status', 'verified'),
                    'seo_title': f"{p['name']} | The Print Planet",
                    'seo_description': f"Wholesale supplier of {p['name']}. Technical specs, bulk MOQ, and competitive B2B quotation.",
                }
            )

            # Associate Image (Prefer Local Disk Asset, Fallback to Remote)
            img_url = None
            sku = p.get('sku')
            local_matches = list(media_products_dir.glob(f"{sku}.*")) if media_products_dir.exists() else []
            if local_matches and local_matches[0].stat().st_size > 0:
                img_url = f"/media/products/{local_matches[0].name}"
            elif p.get('image_url'):
                img_url = p.get('image_url')
                if options.get('download_images'):
                    try:
                        import ssl, urllib.request
                        ctx = ssl.create_default_context()
                        ctx.check_hostname = False
                        ctx.verify_mode = ssl.CERT_NONE
                        ext = img_url.split('.')[-1].split('?')[0] or 'png'
                        dest_file = media_products_dir / f"{sku}.{ext}"
                        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
                            dest_file.write_bytes(resp.read())
                        img_url = f"/media/products/{dest_file.name}"
                    except Exception as err:
                        self.stdout.write(self.style.WARNING(f"Could not download image for {sku}: {err}"))

            if img_url:
                ProductImage.objects.update_or_create(
                    product=prod_obj,
                    defaults={
                        'secure_url': img_url,
                        'alt_text': p['name'],
                        'is_primary': True,
                        'display_order': 0,
                    }
                )

            if created:
                products_created += 1
            else:
                products_updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {len(categories_data)} categories and {products_created + products_updated} products ({products_created} created, {products_updated} updated)."
        ))

        # 3. Configure Site Settings
        settings_obj = SiteSettings.get_settings()
        settings_obj.business_name = "The Print Planet"
        settings_obj.tagline = "Industrial ID Card Solutions, Lanyards & Printing Machinery"
        settings_obj.phone = "+91 98980 61569"
        settings_obj.whatsapp = "+91 98980 61569"
        settings_obj.email = "sales@theprintplanet.in"
        settings_obj.address = "Plot 42, Industrial Area Phase II, Ahmedabad, Gujarat, India - 380004"
        settings_obj.gst_number = "24AWOPP8281E1Z4"
        settings_obj.footer_text = "The Print Planet is a premier industrial manufacturer and distributor of identification systems, satin lanyard rolls, rigid badge holders, metal attachments, card fusing machinery, and RFID solutions."
        settings_obj.save()
        self.stdout.write(self.style.SUCCESS("Configured default Site Settings."))

        # 4. Configure HomePage Sections
        if not HomePageSection.objects.exists():
            s1 = HomePageSection.objects.create(
                section_type='hero',
                title='Industrial ID Card Solutions & Lanyard Supplies',
                subtitle='High-volume manufacturer supplying precision PVC badge holders, premium satin lanyard rolls, heavy-duty metal clips, and industrial card production machinery.',
                display_order=1,
                is_active=True,
                config={
                    'primary_cta_text': 'Explore Catalogue',
                    'primary_cta_link': '/products',
                    'secondary_cta_text': 'Request Wholesale Quote',
                    'secondary_cta_link': '/contact',
                }
            )
            s2 = HomePageSection.objects.create(
                section_type='featured_categories',
                title='Core Product Categories',
                subtitle='Explore our extensive inventory of verified ID accessories and printing hardware.',
                display_order=2,
                is_active=True
            )
            s2.featured_categories.set(Category.objects.all()[:6])

            s3 = HomePageSection.objects.create(
                section_type='popular_products',
                title='Featured Industrial Catalogue',
                subtitle='Top-demand satin rolls, high-clarity holders, and machine fittings ready for immediate dispatch.',
                display_order=3,
                is_active=True
            )
            s3.featured_products.set(Product.objects.filter(is_featured=True)[:8])

            s4 = HomePageSection.objects.create(
                section_type='machinery',
                title='Industrial Card Manufacturing Machinery',
                subtitle='Commercial automatic cutting units, fusing laminators, and digital lanyard heat press presses.',
                display_order=4,
                is_active=True
            )
            machinery_cat = Category.objects.filter(slug='id-card-manufacturing-machines').first()
            if machinery_cat:
                s4.featured_products.set(Product.objects.filter(category=machinery_cat))

            self.stdout.write(self.style.SUCCESS("Configured default HomePage Sections."))

        # 5. Optional Owner Creation
        if options.get('create_owner') or os.environ.get('CREATE_DEFAULT_OWNER', '').lower() in ('true', '1'):
            owner_user = os.environ.get('OWNER_USERNAME', 'admin')
            owner_email = os.environ.get('OWNER_EMAIL', 'owner@theprintplanet.in')
            owner_pass = os.environ.get('OWNER_PASSWORD', 'AdminPass123!Secure')

            if not User.objects.filter(username=owner_user).exists():
                user = User.objects.create_superuser(
                    username=owner_user,
                    email=owner_email,
                    password=owner_pass
                )
                self.stdout.write(self.style.SUCCESS(f"Created default owner user '{owner_user}'."))
            else:
                self.stdout.write(f"Owner user '{owner_user}' already exists.")
