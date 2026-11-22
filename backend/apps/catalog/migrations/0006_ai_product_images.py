"""
Replace product photos with new AI-generated studio images (Nov 2026).

The owner asked to stop using the old supplier photos. Each product listed here gets one new
primary image hosted on Cloudinary (the_print_planet/products-ai/<slug>); its old image rows are
removed. Products are matched by slug and skipped when missing.
"""
from django.db import migrations

IMAGES = {
    '16mm-white-satin-roll-for-sublimation-printing': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346149/the_print_planet/products-ai/16mm-white-satin-roll-for-sublimation-printing.jpg',
    '20-mm-indian-orange-colour-satin-lanyard-roll': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346182/the_print_planet/products-ai/20-mm-indian-orange-colour-satin-lanyard-roll.jpg',
    'a4-inkjet-printable-pvc-core-sheet-sets-3-layer-kit': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346146/the_print_planet/products-ai/a4-inkjet-printable-pvc-core-sheet-sets-3-layer-kit.jpg',
    'blank-and-pre-printed-pvc-cards': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346147/the_print_planet/products-ai/blank-and-pre-printed-pvc-cards.jpg',
    'c2t-id-card-holder': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346182/the_print_planet/products-ai/c2t-id-card-holder.jpg',
    'custom-branded-pre-printed-pvc-cards': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346146/the_print_planet/products-ai/custom-branded-pre-printed-pvc-cards.jpg',
    'custom-sublimation-heat-transfer-printed-lanyards-20mm': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346147/the_print_planet/products-ai/custom-sublimation-heat-transfer-printed-lanyards-20mm.jpg',
    'dct150-a4-pvc-card-making-fusing-machine': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346150/the_print_planet/products-ai/dct150-a4-pvc-card-making-fusing-machine.jpg',
    'dct2000-semi-automatic-double-die-id-card-cutter': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346147/the_print_planet/products-ai/dct2000-semi-automatic-double-die-id-card-cutter.jpg',
    'dct450-continuous-roll-lanyard-print-heat-press-machine': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346148/the_print_planet/products-ai/dct450-continuous-roll-lanyard-print-heat-press-machine.jpg',
    'dct4500-fully-automatic-smart-id-card-cutting-machine': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346182/the_print_planet/products-ai/dct4500-fully-automatic-smart-id-card-cutting-machine.jpg',
    'eh-t-executive-pvc-id-card-holder': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346182/the_print_planet/products-ai/eh-t-executive-pvc-id-card-holder.jpg',
    'h4-id-card-holder': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346182/the_print_planet/products-ai/h4-id-card-holder.jpg',
    'lanyards-plastic-hook-16-mm': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346182/the_print_planet/products-ai/lanyards-plastic-hook-16-mm.jpg',
    'm-16mm-clamp-for-lanyards': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346148/the_print_planet/products-ai/m-16mm-clamp-for-lanyards.jpg',
    'mifare-1k-classic-rfid-iso-smart-cards': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346149/the_print_planet/products-ai/mifare-1k-classic-rfid-iso-smart-cards.jpg',
    'pvc-plastic-cards': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346148/the_print_planet/products-ai/pvc-plastic-cards.jpg',
    'side-lever-dog-hook-20-mm': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346183/the_print_planet/products-ai/side-lever-dog-hook-20-mm.jpg',
    'vs-id-card-holder': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346148/the_print_planet/products-ai/vs-id-card-holder.jpg',
    'wenlin-fa7500y10-oil-heating-automatic-card-laminator': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346149/the_print_planet/products-ai/wenlin-fa7500y10-oil-heating-automatic-card-laminator.jpg',
    'wenlin-frosted-steel-plates-for-plastic-card': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346149/the_print_planet/products-ai/wenlin-frosted-steel-plates-for-plastic-card.jpg',
    'wenlin-new-full-auto-5600-smart-ic-card-laminator': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346150/the_print_planet/products-ai/wenlin-new-full-auto-5600-smart-ic-card-laminator.jpg',
    'wenlin-xinguan-series-ipc-full-auto-ic-card-laminator': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346150/the_print_planet/products-ai/wenlin-xinguan-series-ipc-full-auto-ic-card-laminator.jpg',
    'wl-8000t-automatic-card-hot-stamping-machine': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346151/the_print_planet/products-ai/wl-8000t-automatic-card-hot-stamping-machine.jpg',
    'wl-acol800-sheet-collating-overlay-machine': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346150/the_print_planet/products-ai/wl-acol800-sheet-collating-overlay-machine.jpg',
    'wl-hsa-3c-fully-automatic-a3-plus-card-puncher': 'https://res.cloudinary.com/pmq4rert/image/upload/v1795346151/the_print_planet/products-ai/wl-hsa-3c-fully-automatic-a3-plus-card-puncher.jpg',
}


def forwards(apps, schema_editor):
    Product = apps.get_model('catalog', 'Product')
    ProductImage = apps.get_model('catalog', 'ProductImage')

    for slug, url in IMAGES.items():
        product = Product.objects.filter(slug=slug).first()
        if not product:
            continue
        if ProductImage.objects.filter(product=product, secure_url=url).exists():
            continue
        ProductImage.objects.filter(product=product).delete()
        ProductImage.objects.create(
            product=product, secure_url=url, alt_text=product.name,
            cloudinary_public_id=url.rsplit('/upload/', 1)[1].split('/', 1)[1].rsplit('.', 1)[0],
            is_primary=True, display_order=0,
        )


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0005_sheet_catalogue_products'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
