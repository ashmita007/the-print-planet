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
        settings_obj.business_name = "THE PRINT PLANET"
        settings_obj.tagline = "Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions"
        settings_obj.phone = "+91 97418 08034"
        settings_obj.whatsapp = "+91 97418 08034"
        settings_obj.email = "theprintplanet01@gmail.com"
        settings_obj.address = "No.17, Ground Floor, 7th Main, 13th Cross Rd, Agrahara Dasarahalli, Rajajinagar Industrial Town, Bengaluru (Bangalore) Urban, Bengaluru - 560079, Karnataka, India"
        settings_obj.gst_number = "29AAQFT3909B1ZZ"
        settings_obj.footer_text = "THE PRINT PLANET - Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions. ✱ Your Vision is Our Focus ✱. GSTIN: 29AAQFT3909B1ZZ | PAN: AAQFT3909B."
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

        # Ensure flagship models are marked as featured for homepage showcase
        flagship_skus = [
            'LAN-ROY-20M', 'LAN-ORA-20M', 'LAN-PUR-20M', 'LAN-BLA-20M',
            'HLD-V2', 'HLD-H4', 'HLD-VST', 'HLD-C2T',
            'HOK-SIDELEVE-08', 'HOK-LANYARDS-01',
            'MCH-DCT150', 'MCH-DCT4500', 'CRD-MF1K-WHT'
        ]
        Product.objects.filter(sku__in=flagship_skus).update(is_featured=True)

        # 5. Optional Owner Creation
        if options.get('create_owner') or os.environ.get('CREATE_DEFAULT_OWNER', '').lower() in ('true', '1'):
            owner_user = os.environ.get('OWNER_USERNAME', 'admin')
            owner_email = os.environ.get('OWNER_EMAIL', 'shriaknth.yathnala@gmail.com')
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

        # 6. Seed Sample B2B Enquiries
        from apps.enquiries.models import Enquiry
        if not Enquiry.objects.exists():
            royal_blue = Product.objects.filter(sku='LAN-ROY-20M').first()
            v2_holder = Product.objects.filter(sku='HLD-V2').first()
            rfid_card = Product.objects.filter(sku='CRD-MF1K-WHT').first()
            fusing_machine = Product.objects.filter(sku='MCH-DCT150').first()
            dog_hook = Product.objects.filter(sku='HOK-SIDELEVE-08').first()

            Enquiry.objects.create(
                full_name="Rajesh Sharma",
                company_name="Apex Corporate Solutions Ltd, Bengaluru",
                email="rajesh.s@apexcorp.in",
                phone="+91 98450 21345",
                product=royal_blue,
                product_name_text=royal_blue.name if royal_blue else "20MM Indian Royal Blue Colour Satin Lanyard Roll",
                requested_quantity=50,
                message="Urgent requirement for 50 rolls of 20mm Royal Blue satin lanyard for our annual corporate summit. Please share best trade price and dispatch schedule.",
                source_page="/products/20mm-indian-royal-blue-colour-satin-lanyard-roll",
                status="new",
                admin_notes=""
            )

            Enquiry.objects.create(
                full_name="Pooja Verma",
                company_name="St. Xavier Group of Institutions, Mumbai",
                email="pooja.verma@stxaviers.edu.in",
                phone="+91 98201 54321",
                product=v2_holder,
                product_name_text=v2_holder.name if v2_holder else "V2 ID Card Holder",
                requested_quantity=2500,
                message="Looking to purchase 2500 units of semi-transparent frosted V2 vertical holders for new university academic year. Please send sample kit to our Mumbai campus.",
                source_page="/products/v2-id-card-holder",
                status="in_progress",
                admin_notes="Dispatched 2 samples via courier on 10th. Tracking sent to client via WhatsApp."
            )

            Enquiry.objects.create(
                full_name="Vikramaditya Mehta",
                company_name="Kavya Security Systems, Ahmedabad",
                email="vikram@kavyasecurity.com",
                phone="+91 97230 89110",
                product=rfid_card,
                product_name_text=rfid_card.name if rfid_card else "Mifare 1K 13.56MHz RFID Smart Card",
                requested_quantity=5000,
                message="Need quotation for 5,000 contactless 1K RFID cards for commercial business park access turnstiles. Please confirm standard delivery timeline.",
                source_page="/products/mifare-1k-1356mhz-rfid-smart-card",
                status="quoted",
                admin_notes="Official quotation #QUO-2026-089 sent at ₹18.50 per card + GST. Awaiting client purchase order approval."
            )

            Enquiry.objects.create(
                full_name="Sunil Kulkarni",
                company_name="Precision Print Hub, Pune",
                email="sunil@precisionprint.in",
                phone="+91 98900 77123",
                product=fusing_machine,
                product_name_text=fusing_machine.name if fusing_machine else "DCT150 A4+ PVC Card Making Fusing Machine",
                requested_quantity=1,
                message="Planning to install a new PVC card fusing production setup. Please provide complete specification sheet, warranty details, and technician installation support in Pune.",
                source_page="/products/dct150-a4-pvc-card-making-fusing-machine",
                status="new",
                admin_notes=""
            )

            Enquiry.objects.create(
                full_name="Ananya Nair",
                company_name="Global Events & Exhibitions, Hyderabad",
                email="ananya.n@globalevents.co.in",
                phone="+91 94401 33290",
                product=dog_hook,
                product_name_text=dog_hook.name if dog_hook else "Side Lever / Dog Hook 20 mm",
                requested_quantity=10000,
                message="Repeat order: 10,000 units of 20mm Dog Hook attachments for international expo visitor badges. Required by 25th.",
                source_page="/products/side-lever-dog-hook-20-mm",
                status="closed",
                admin_notes="Dispatched and delivered. Payment received in full."
            )

            self.stdout.write(self.style.SUCCESS("Seeded 5 sample B2B customer enquiries."))
