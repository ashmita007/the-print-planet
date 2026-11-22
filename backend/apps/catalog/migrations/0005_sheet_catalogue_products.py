"""
Add the product range from the owner's product sheet (Shrikanth.xlsx, Nov 2026).

New categories: lens packaging, lens cleaning, ID card printers and consumables, ID card
accessories (with lanyards) and commercial printing (offset, digital, finishing). Products go
into those and into existing categories (PVC and smart cards, ID card holders, PVC core and
coated overlay sheets).

The sheet gives names only, so products are quote-only: no price or MOQ, and the copy states
only what the name says. Rows are matched by slug and skipped when they already exist, so the
migration is safe to run on a database where the owner has added or edited them.
"""
from django.db import migrations
from django.utils.text import slugify

QUOTE = 'Share the quantity, size and print or branding details to get a quote.'

# slug: (name, parent slug or None, description)
CATEGORIES = {
    'pvc-and-smart-cards': (
        'PVC and Smart Cards', None,
        'Blank, pre-printed, RFID, NFC, proximity and smart cards for ID, access control, '
        'membership, loyalty, gift and warranty use. ' + QUOTE,
    ),
    'lens-packaging-products': (
        'Lens Packaging Products', None,
        'Envelopes, optical bags, pouches and ziplock covers for packing and dispatching spectacle '
        'lenses, plain or printed with your shop name. ' + QUOTE,
    ),
    'lens-cleaning-solutions': (
        'Lens Cleaning Solutions', None,
        'Lens wipes, sprays, anti-fog solutions, microfiber cloths and cleaning kits for optical '
        'stores, opticians and corporate gifting, available plain or custom-branded. ' + QUOTE,
    ),
    'id-card-printers-and-consumables': (
        'ID Card Printers and Consumables', None,
        'Direct-to-card and retransfer ID card printers, ribbons, overlays, laminators, encoding '
        'systems, card readers and software, with installation and technical support. ' + QUOTE,
    ),
    'id-card-accessories': (
        'ID Card Accessories', None,
        'Lanyards, card sleeves, hooks, clips, reels and straps for ID cards in offices, schools '
        'and events. ' + QUOTE,
    ),
    'lanyards': (
        'Lanyards', 'id-card-accessories',
        'Polyester, nylon, satin, woven and eco-friendly lanyards, plain or printed with your logo, '
        'with hook, clip, buckle, breakaway and badge reel options. ' + QUOTE,
    ),
    'commercial-printing-solutions': (
        'Commercial Printing Solutions', None,
        'Offset and digital printing for brochures, business cards, stationery, packaging, labels '
        'and event material, with lamination, UV, foiling, die-cutting and binding. ' + QUOTE,
    ),
    'offset-printing': (
        'Offset Printing', 'commercial-printing-solutions',
        'Offset printing for larger runs of brochures, catalogues, stationery, books, calendars, '
        'packaging and labels. ' + QUOTE,
    ),
    'digital-printing': (
        'Digital Printing', 'commercial-printing-solutions',
        'Digital printing for short runs, variable data and quick jobs: flyers, business cards, '
        'stickers, posters, certificates and event material. ' + QUOTE,
    ),
    'finishing-and-conversion': (
        'Finishing and Conversion', 'commercial-printing-solutions',
        'Print finishing: lamination, UV and spot UV, foiling, embossing, die-cutting, binding, '
        'folding, perforation, cutting and packing. ' + QUOTE,
    ),
}

# category slug: (use phrase for copy, [product names] or [(name, dimensions)])
PRODUCTS = {
    'pvc-and-smart-cards': ('offices, schools, clubs, retail and events', [
        'Custom-Branded Pre-Printed PVC Cards',
        'Blank and Pre-Printed PVC Cards',
        'PVC Plastic Cards',
        'RFID and NFC Cards',
        'Proximity and Access-Control Cards',
        'Employee and Student ID Cards',
        'Membership and Loyalty Cards',
        'Gift and Promotional Cards',
        'Warranty and Authenticity Cards',
        'Holographic and Security-Feature Cards',
        'QR Code and Serial-Numbered Cards',
        'Custom-Designed Smart Cards',
        'Plain PVC Cards for All Card Printers',
    ]),
    'lens-packaging-products': ('optical stores, lens labs and opticians', [
        'Lens Envelopes (M Fold) - Customized',
        'Lens Envelopes (M Fold) - Plain',
        'Lens Envelopes (M Fold) with Glassine',
        'Lens Optical Bags - Customized',
        'Lens Storage and Protection Pouches',
        'Biodegradable Ziplock Covers',
    ]),
    'lens-cleaning-solutions': ('optical stores, opticians and corporate gifting', [
        'Pre-Moistened Lens Wipes',
        'Lens Cleaning Sprays',
        'Anti-Fog Cleaning Solutions',
        'Microfiber Cleaning Cloths - Custom-Branded',
        'Optical Cleaning Tissues',
        'Lens Cleaning Kits',
        'Cleaning Swabs and Brushes',
    ]),
    'id-card-printers-and-consumables': ('offices, schools, card printing shops and institutions', [
        'Single-Sided and Dual-Sided ID Card Printers',
        'Direct-to-Card Printers',
        'Retransfer Card Printers',
        'Colour and Monochrome Card Printers',
        'RFID and Smart-Card Printers',
        'Card Printer Ribbons and Consumables',
        'Blank Printing Cards',
        'Card Printer Cleaning Kits',
        'Card Laminators and Lamination Pouches',
        'Holographic Overlays',
        'Card Printing and Design Software',
        'Card Encoding Systems',
        'USB Card Readers',
        'ID Card Issuance and Management Solutions',
        'Card Printer Installation, Training and Technical Support',
    ]),
    'lanyards': ('offices, schools, conferences and events', [
        'Polyester Lanyards',
        'Nylon Lanyards',
        'Woven and Tubular Lanyards',
        'Satin Lanyards',
        'Eco-Friendly Lanyards',
        'Printed and Customised Lanyards',
        'Double-Ended Lanyards',
        'Breakaway Safety Lanyards',
        'Retractable Badge Reel Lanyards',
        'Lanyards with Metal Clips, Hooks or Buckles',
    ]),
    'id-card-holder': ('offices, schools, hospitals and events', [
        'Vertical Card Holders',
        'Horizontal Card Holders',
        'Single-Card Holders',
        'Dual-Card Holders',
        'Multi-Card Holders',
        'Transparent PVC Card Holders',
        'Rigid Plastic Card Holders',
        'Soft Vinyl Card Holders',
        'RFID-Blocking Card Holders',
        'Waterproof Card Holders',
        'Secure-Lock Card Holders',
        'Badge Reels and Retractable Holders',
        'Card Clips and Badge Clips',
        'Arm Badge Holders',
        'Wristband and Event Card Holders',
        'Custom-Branded Card Holders',
    ]),
    'id-card-accessories': ('offices, schools and events', [
        'ID Card Sleeves',
        'Badge Clips',
        'Metal Hooks',
        'Plastic Clips',
        'Snap Hooks',
        'Swivel Hooks',
        'Card Reels',
        'Neck Straps',
        'Wrist Straps',
        'Custom-Printed ID Card Accessories',
    ]),
    'offset-printing': ('businesses, schools, publishers and brands', [
        'Brochures and Catalogues',
        'Flyers and Leaflets',
        'Business Cards',
        'Letterheads and Envelopes',
        'Company Profiles',
        'Magazines and Newsletters',
        'Books and Annual Reports',
        'Calendars and Diaries',
        'Notebooks and Stationery',
        'Packaging Boxes and Cartons',
        'Labels and Tags',
        'Posters and Promotional Materials',
    ]),
    'digital-printing': ('businesses, events and short-run jobs', [
        'Short-Run Brochures and Flyers',
        'Variable-Data Printing',
        'Personalised Direct Mail',
        'Business Cards and Stationery',
        'Digital Labels and Stickers',
        'Posters and Banners',
        'Photo Books and Portfolios',
        'Presentation Folders',
        'Certificates and Invitations',
        'Event Materials',
        'On-Demand Books and Catalogues',
        'Proofing and Sample Prints',
    ]),
    'finishing-and-conversion': ('printed jobs that need finishing before delivery', [
        'Lamination',
        'UV Coating',
        'Spot UV',
        'Foiling',
        'Embossing and Debossing',
        'Die-Cutting',
        'Collating and Binding',
        'Folding and Creasing',
        'Perforation',
        'Booklet and Calendar Production',
        'Cutting and Trimming',
        'Packaging and Dispatch Services',
    ]),
    'pvc-core-sheets-for-id-card-printing': ('PVC card manufacturing', [
        ('PVC Core Sheet 483 x 594 x 0.32 mm', '483 mm x 594 mm x 0.32 mm'),
        ('PVC Core Sheet 483 x 305 x 0.32 mm', '483 mm x 305 mm x 0.32 mm'),
    ]),
    'coated-overlay-sheets-for-pvc-id-card': ('PVC card manufacturing', [
        ('Coated Overlay Sheet 483 x 594 x 0.08 mm', '483 mm x 594 mm x 0.08 mm'),
        ('Coated Overlay Sheet 483 x 305 x 0.08 mm', '483 mm x 305 mm x 0.08 mm'),
    ]),
}


# Printing and finishing are services, so their copy says "by", not "supplied by".
SERVICE_CATEGORIES = {'offset-printing', 'digital-printing', 'finishing-and-conversion'}


def _copy(name, use, service):
    verb = 'by' if service else 'supplied by'
    short = f'{name} {verb} The Print Planet, Bengaluru, for {use}.'
    return short, f'{short} {QUOTE}'


def forwards(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    Product = apps.get_model('catalog', 'Product')

    for order, (slug, (name, parent_slug, description)) in enumerate(CATEGORIES.items(), start=20):
        if Category.objects.filter(slug=slug).exists():
            continue
        parent = Category.objects.filter(slug=parent_slug).first() if parent_slug else None
        if parent_slug and not parent:
            continue
        Category.objects.create(
            slug=slug, name=name.upper(), parent=parent, description=description,
            display_order=order, is_active=True,
        )

    for cat_slug, (use, items) in PRODUCTS.items():
        category = Category.objects.filter(slug=cat_slug).first()
        if not category:
            continue
        for order, item in enumerate(items):
            name, dimensions = item if isinstance(item, tuple) else (item, None)
            slug = slugify(name)
            if Product.objects.filter(slug=slug).exists():
                continue
            short, description = _copy(name, use, cat_slug in SERVICE_CATEGORIES)
            Product.objects.create(
                name=name, slug=slug, sku=f'TPP-{slug}'[:100], category=category,
                short_description=short, description=description, dimensions=dimensions,
                price=None, minimum_order_quantity=None, display_order=order,
                is_active=True, verification_status='pending',
            )


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0004_merge_duplicate_categories'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
