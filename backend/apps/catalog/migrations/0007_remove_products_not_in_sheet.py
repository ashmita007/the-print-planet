"""
Remove products that are not in the owner's product sheet (Shrikanth.xlsx, Nov 2026).

The sheet keeps its listed items plus "all PVC sheets, overlays and inlays", "all existing
lanyard rolls and other items" and "all machines". Everything below falls outside it: bare
raw-material codes filed under holders, a mis-named duplicate of the yellow sublimation ink,
an "m_chip" test row, the sample kit, gumming rolls and the crystal liquid.

Products are matched by slug and skipped when missing. Their categories are deleted only when
nothing is left in them. Images cascade with the product; their Cloudinary files are removed
separately after the deploy.
"""
from django.db import migrations

REMOVED_PRODUCT_SLUGS = [
    'shrikanth',
    'm_chip',
    'pc',
    'hiph',
    'pp-r',
    'gpps',
    'yarn-75',
    'yarn-150',
    'yarn-450',
    'sample-kit-holder',
    'sensui-12-inch-x-50-mitter-roll',
    'solvent-gumming-roll-12-x-50-mitter-inch',
    'transparent-crystal-liquid-for-id-cards',
]

EMPTIED_CATEGORY_SLUGS = [
    'sample-kit',
    'gumming-roll-for-sticker-card',
    'gumming-roll',
    'gaming-roll',
    'transparent-crystal-liquid-for-id-cards',
]


def remove(apps, product_slugs, category_slugs):
    Category = apps.get_model('catalog', 'Category')
    Product = apps.get_model('catalog', 'Product')

    Product.objects.filter(slug__in=product_slugs).delete()
    for category in Category.objects.filter(slug__in=category_slugs):
        if not Product.objects.filter(category=category).exists() and not category.subcategories.exists():
            category.delete()


def forwards(apps, schema_editor):
    remove(apps, REMOVED_PRODUCT_SLUGS, EMPTIED_CATEGORY_SLUGS)


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0006_ai_product_images'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
