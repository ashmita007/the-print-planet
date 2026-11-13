"""
SEO audit clean-up of catalogue data (Nov 2026).

Touches only the rows named here, matched by slug, and skips any that are missing, so it is
safe on a database where the owner has already edited them:

* Short, complete titles for products whose names run past Google's ~60 characters.
* "Ovel" -> "Oval" in product names, titles and copy (slugs unchanged).
* Misspelled URLs renamed; the old URLs 301 to the new ones in frontend/next.config.ts.
* Laminator plates, cushion pad and a PVC core sheet kit moved out of the RFID category,
  and aluminium holders moved under ID card holders.
* Category copy that claimed "Manufactured by The Print Planet" now says "Supplied by".
"""
import re

from django.db import migrations

SEO_TITLES = {
    'wenlin-frosted-steel-plates-for-plastic-card': 'WENLIN Frosted Steel Lamination Plates for Plastic Cards',
    'wenlin-new-full-auto-5600-smart-ic-card-laminator': 'WENLIN 5600 Fully Automatic Smart IC Card Laminator',
    'wenlin-fa7500y10-oil-heating-automatic-card-laminator': 'WENLIN 7500Y-10 Oil-Heating Automatic Card Laminator',
    'wenlin-thermal-cushion-pad-for-card-laminator': 'WENLIN Thermal Cushion Pad for Card Laminators',
    'wl-acol800-sheet-collating-overlay-machine': 'WL-ACOL800 Sheet Collating & Overlay Laminating Machine',
    'wenlin-fa7500at-10-automatic-transfer-laminator-yinguan': 'WENLIN FA7500AT-10 Automatic Transfer Laminator',
    'wenlin-new-full-auto-7500-laminating-machine': 'WENLIN 7500 Intelligent Card Laminating Machine',
}

CATEGORY_SLUGS = {
    'rfid-cansumables': 'rfid-consumables',
    'plastic-lanyard-hook-clip-accessorie': 'plastic-lanyard-hook-clip-accessories',
    'gaming-roll': 'gumming-roll',
}

PRODUCT_SLUGS = {
    'clamp-feeting-machine-single-side': ('clamp-fitting-machine-single-side', 'Clamp Fitting Machine Single Side'),
}

PRODUCT_MOVES = {
    'wenlin-frosted-steel-plates-for-plastic-card': 'parts-accessories-for-machine',
    'wenlin-brushed-texture-steel-lamination-plate': 'parts-accessories-for-machine',
    'wenlin-8k-mirror-glossy-steel-lamination-plates': 'parts-accessories-for-machine',
    'wenlin-thermal-cushion-pad-for-card-laminator': 'parts-accessories-for-machine',
    'a4-inkjet-printable-pvc-core-sheet-sets-3-layer-kit': 'pvc-core-sheets-for-id-card-printing',
}

CATEGORY_PARENTS = {
    'aluminium-metal-holder': 'id-card-holder',
}

OVEL = re.compile(r'\bovel\b', re.I)


def _oval(text):
    return OVEL.sub(lambda m: 'OVAL' if m.group(0).isupper() else 'Oval', text or '')


def forwards(apps, schema_editor):
    Product = apps.get_model('catalog', 'Product')
    Category = apps.get_model('catalog', 'Category')

    for slug, title in SEO_TITLES.items():
        Product.objects.filter(slug=slug).update(seo_title=title)

    candidates = Product.objects.filter(name__icontains='ovel') | Product.objects.filter(seo_title__icontains='ovel')
    for p in candidates.distinct():
        if not (OVEL.search(p.name or '') or OVEL.search(p.seo_title or '')):
            continue  # e.g. "novel"
        p.name = _oval(p.name)
        p.seo_title = _oval(p.seo_title)
        p.description = _oval(p.description)
        p.short_description = _oval(p.short_description)
        p.save(update_fields=['name', 'seo_title', 'description', 'short_description'])

    for old, new in CATEGORY_SLUGS.items():
        if not Category.objects.filter(slug=new).exists():
            Category.objects.filter(slug=old).update(slug=new)

    for old, (new, name) in PRODUCT_SLUGS.items():
        if not Product.objects.filter(slug=new).exists():
            Product.objects.filter(slug=old).update(slug=new, name=name)

    for slug, cat_slug in PRODUCT_MOVES.items():
        cat = Category.objects.filter(slug=cat_slug).first()
        if cat:
            Product.objects.filter(slug=slug).update(category=cat)

    for slug, parent_slug in CATEGORY_PARENTS.items():
        parent = Category.objects.filter(slug=parent_slug).first()
        if parent:
            Category.objects.filter(slug=slug).update(parent=parent)

    for c in Category.objects.filter(description__icontains='Manufactured by The Print Planet'):
        c.description = re.sub(r'Manufactured by The Print Planet', 'Supplied by The Print Planet', c.description, flags=re.I)
        c.save(update_fields=['description'])


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0002_alter_productimage_secure_url'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
