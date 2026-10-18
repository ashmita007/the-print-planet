import os
import sys
import json
import re
import ssl
import urllib.request
from pathlib import Path
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.db import transaction
from django.db.models import Q
from apps.catalog.models import Category, Product, ProductImage

import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name='pmq4rert',
    api_key='496388753899233',
    api_secret='NFgWJvwr_prZlSHy9ppt7g55aX0',
    secure=True
)

def rebrand(text):
    if not text:
        return ""
    t = re.sub(r'(?i)delta\s*industry', 'The Print Planet', text)
    t = re.sub(r'(?i)delta\s*cardz', 'The Print Planet', t)
    t = re.sub(r'(?i)jbr\s*plast\s*llp', 'The Print Planet Manufacturing Unit', t)
    t = re.sub(r'(?i)ahmedabad\s*(\(gujarat\))?', 'Bengaluru & Pan-India', t)
    t = re.sub(r'(?i)we\s*make\s*your\s*identity', 'Premium B2B Printing & Packaging Supplies', t)
    return t.strip()

def clean_norm(s):
    return re.sub(r'[^a-z0-9]', '', (s or '').lower())

class Command(BaseCommand):
    help = "Seed categories, subcategories, and deduplicated products from deltacardz.com"

    def handle(self, *args, **options):
        dump_path = Path('data/deltacardz_dump.json')
        if not dump_path.exists():
            self.stdout.write(self.style.ERROR("data/deltacardz_dump.json not found!"))
            return

        with open(dump_path, 'r', encoding='utf-8') as f:
            dump = json.load(f)

        ctx = ssl._create_unverified_context()
        media_products_dir = Path('backend/media/products')
        media_products_dir.mkdir(parents=True, exist_ok=True)

        self.stdout.write(self.style.NOTICE("=== Step 1: Creating Main Categories ==="))
        delta_cats = dump['categories']
        delta_subcats = dump['subcategories']
        delta_products = dump['products']

        main_cat_map = {}  # delta_cat_id -> Category instance
        for c in delta_cats:
            slug = c['slug']
            name = c['name'].strip()
            desc = rebrand(c.get('description') or f"Premium wholesale {name} supplied by The Print Planet.")
            
            cat, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': desc,
                    'parent': None,
                    'is_active': True,
                    'display_order': c.get('display_order', 0),
                }
            )
            if not created:
                cat.name = name
                cat.description = desc
                cat.parent = None
                cat.is_active = True
                cat.save()
            main_cat_map[c['id']] = cat
            self.stdout.write(f"  [Main Category] {name} ({slug}) -> ID: {cat.id}")

        self.stdout.write(self.style.NOTICE("\n=== Step 2: Creating Subcategories ==="))
        subcat_map = {}  # delta_subcat_id -> Category instance
        for s in delta_subcats:
            slug = s['slug']
            name = s['name'].strip()
            parent = main_cat_map.get(s['category_id'])
            desc = rebrand(s.get('description') or f"Commercial grade {name} from The Print Planet.")
            
            # Check if category with this slug exists
            cat = Category.objects.filter(slug=slug).first()
            if not cat:
                # Check by name
                cat = Category.objects.filter(name__iexact=name).first()

            if cat:
                cat.name = name
                cat.parent = parent
                cat.description = desc or cat.description
                cat.is_active = True
                cat.save()
            else:
                cat = Category.objects.create(
                    name=name,
                    slug=slug,
                    description=desc,
                    parent=parent,
                    is_active=True,
                    display_order=s.get('display_order', 0),
                )
            subcat_map[s['id']] = cat
            self.stdout.write(f"  [Subcategory] {parent.name if parent else 'No Parent'} -> {name} ({cat.slug})")

        self.stdout.write(self.style.NOTICE("\n=== Step 3: Nesting Existing Print Planet Categories ==="))
        # Map our existing 10 categories to their respective main parent categories
        parent_mappings = {
            'semi-transparent-pvc-id-card-holder': 'id-card-holder',
            'crystal-clear-pvc-id-card-holder': 'id-card-holder',
            'pvc-id-card-sticker-pasting-holder': 'id-card-holder',
            'executive-pvc-id-card-holder': 'id-card-holder',
            'id-card-lanyard-hooks': 'id-card-lanyard-consumables',
            'lanyard-fitting-metal-clamp-for-id-card-lanyards': 'id-card-lanyard-consumables',
            'color-id-card-lanyard-roll': 'indian-satin-digital-lanyard-roll',
            'white-satin-digital-lanyard-roll': 'indian-satin-digital-lanyard-roll',
            'id-card-manufacturing-machines': 'machines',
            'rfid-smart-cards-and-consumables': 'rfid-cansumables',
        }

        for sub_slug, parent_slug in parent_mappings.items():
            sub = Category.objects.filter(slug=sub_slug).first()
            par = Category.objects.filter(slug=parent_slug).first()
            if sub and par and sub != par:
                sub.parent = par
                sub.save(update_fields=['parent'])
                self.stdout.write(f"  Nested: {sub.name} -> under parent: {par.name}")

        self.stdout.write(self.style.NOTICE("\n=== Step 4: Deduplicating and Seeding Products ==="))
        db_products = list(Product.objects.all())
        existing_skus = {p.sku: p for p in db_products}
        
        added_count = 0
        updated_count = 0
        skipped_count = 0

        for dp in delta_products:
            d_name = dp['name'].strip()
            d_clean = clean_norm(d_name)
            d_sku = dp.get('sku', '').strip()
            
            # Find match in existing DB products
            found_product = None
            if d_sku and d_sku in existing_skus:
                found_product = existing_skus[d_sku]
            else:
                for p in db_products:
                    p_clean = clean_norm(p.name)
                    if d_clean == p_clean or (len(d_clean) > 8 and d_clean in p_clean) or (len(p_clean) > 8 and p_clean in d_clean):
                        found_product = p
                        break
                    m_d = re.findall(r'\b[a-z]{1,3}\d{1,2}[a-z]?\b', d_name.lower())
                    m_p = re.findall(r'\b[a-z]{1,3}\d{1,2}[a-z]?\b', p.name.lower())
                    if m_d and m_p and set(m_d) == set(m_p) and ('holder' in d_name.lower() and 'holder' in p.name.lower()):
                        found_product = p
                        break

            # Determine appropriate category
            target_cat = None
            if dp.get('sub_category_id') and dp['sub_category_id'] in subcat_map:
                target_cat = subcat_map[dp['sub_category_id']]
            elif dp.get('category_id') and dp['category_id'] in main_cat_map:
                target_cat = main_cat_map[dp['category_id']]
            
            if not target_cat:
                target_cat = Category.objects.first()

            if found_product:
                # Update existing product category to subcategory if appropriate
                if target_cat and target_cat.parent:
                    found_product.category = target_cat
                    found_product.save(update_fields=['category'])
                self.stdout.write(f"  [DEDUPLICATED / KEPT] \"{found_product.name}\" (SKU: {found_product.sku}) in {found_product.category.name}")
                updated_count += 1
                continue

            # New product to add
            safe_sku = d_sku
            if not safe_sku or safe_sku in existing_skus:
                safe_sku = f"PP-{slugify(d_name)[:20].upper()}-{added_count+1}"

            price_val = Decimal(str(dp.get('base_price') or 0.0))
            unit_val = dp.get('unit') or 'pcs'
            price_disp = f"₹ {price_val:,.2f} / {unit_val}" if price_val > 0 else "Get Wholesale Quote"
            
            desc_val = rebrand(dp.get('description') or f"Commercial grade {d_name} supplied by The Print Planet for corporate, school, event, and industrial applications.")
            
            # Build specs JSON
            specs_val = {}
            if dp.get('hsn_code'):
                specs_val['HSN Code'] = str(dp['hsn_code'])
            if dp.get('unit'):
                specs_val['Unit'] = str(dp['unit'])
            if dp.get('dimensions'):
                specs_val['Dimensions'] = str(dp['dimensions'])
            if dp.get('min_order_qty'):
                specs_val['Minimum Order Quantity'] = f"{dp['min_order_qty']} {unit_val}"
            if dp.get('gst_percent'):
                specs_val['GST Rate'] = f"{dp['gst_percent']}%"

            new_prod = Product.objects.create(
                name=d_name,
                sku=safe_sku,
                category=target_cat,
                short_description=desc_val[:200],
                description=desc_val,
                price=price_val if price_val > 0 else None,
                price_display=price_disp,
                minimum_order_quantity=int(float(dp.get('min_order_qty') or 1)),
                specifications=specs_val,
                is_active=dp.get('is_active', True),
                verification_status='verified',
                reference_source_url="https://deltacardz.com",
            )
            existing_skus[safe_sku] = new_prod
            db_products.append(new_prod)

            # Handle Product Images
            image_urls = dp.get('image_urls') or []
            if image_urls:
                img_url = image_urls[0]
                local_fname = f"{safe_sku}.jpg"
                local_fpath = media_products_dir / local_fname
                
                try:
                    req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
                        img_bytes = r.read()
                    with open(local_fpath, 'wb') as img_f:
                        img_f.write(img_bytes)

                    # Upload to Cloudinary
                    c_res = cloudinary.uploader.upload(
                        str(local_fpath),
                        folder="the_print_planet/products",
                        public_id=safe_sku,
                        overwrite=True,
                    )
                    cdn_url = c_res.get('secure_url')
                    pub_id = c_res.get('public_id')

                    ProductImage.objects.create(
                        product=new_prod,
                        cloudinary_public_id=pub_id,
                        secure_url=cdn_url,
                        alt_text=new_prod.name,
                        is_primary=True,
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"    Image upload warning for {safe_sku}: {e}"))
                    ProductImage.objects.create(
                        product=new_prod,
                        cloudinary_public_id="",
                        secure_url=f"/media/products/{local_fname}",
                        alt_text=new_prod.name,
                        is_primary=True,
                    )
            else:
                # Fallback to category placeholder
                ProductImage.objects.create(
                    product=new_prod,
                    cloudinary_public_id="",
                    secure_url="/images/placeholder-product.png",
                    alt_text=new_prod.name,
                    is_primary=True,
                )

            added_count += 1
            self.stdout.write(self.style.SUCCESS(f"  [ADDED NEW] [{safe_sku}] {new_prod.name} in {target_cat.name}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nSeeding Complete! Added: {added_count}, Deduplicated/Kept: {updated_count}, Total Products: {Product.objects.count()}, Total Categories: {Category.objects.count()}."
        ))
