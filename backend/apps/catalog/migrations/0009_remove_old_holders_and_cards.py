"""
Remove old products that are not in the owner's product sheet (Shrikanth.xlsx, Nov 2026),
confirmed by the owner on 22 Nov 2026: the model-specific ID card holders (aluminium, crystal
clear, executive, semi-transparent and sticker pasting) and the MIFARE 1K and EM4100 cards.
The sheet's generic holder and card items, added in 0005, stay.

Same rules as 0007: match by slug, skip missing rows, delete a category only when it is empty.
"""
from importlib import import_module

from django.db import migrations

remove_unlisted = import_module('apps.catalog.migrations.0007_remove_products_not_in_sheet')

REMOVED_PRODUCT_SLUGS = [
    'eh-t-executive-pvc-id-card-holder',
    'vs-id-card-holder',
    'c2t-id-card-holder',
    'vs-t-id-card-holder',
    'h4-id-card-holder',
    'v2-id-card-holder',
    'v4-white-colour',
    'silver-horizontal-aluminium-holder',
    'blue-horizontal-aluminium-holder',
    'eh-t-executive-crystal-clear-id-card-holder',
    'black-horizontal-aluminium-holder',
    'gold-horizontal-aluminium-holder',
    'red-horizontal-aluminium-holder',
    'black-vertical-aluminium-holder',
    'silver-vertical-aluminium-holder',
    'blue-vertical-aluminium-holder',
    'gold-vertical-aluminium-holder',
    'red-vertical-aluminium-holder',
    'hs-sticker-id-card-pasting-holder',
    'eh-w-executive-pasting-id-card-holder',
    'ev-t-executive-crystal-clear-id-card-holder',
    'hs2-t-b',
    'ev-w-executive-pasting-id-card-holder',
    'vst-pvc-sticker-id-card-pasting-transparent-holder',
    'vs-sticker-id-card-pasting-holder',
    'vs2t-id-card-holder',
    'vs-l-single-side-sticker-holder',
    'hst-b-pvc-sticker-id-card-pasting-transparent-holder',
    'vst-b-pvc-sticker-id-card-pasting-transparent-holder',
    'hs2t-id-card-holder',
    'ev-t-executive-pvc-id-card-holder',
    'eh-w-executive-plates-id-card-holder',
    'ev-w-executive-plates-id-card-holder',
    'vs2-id-card-holder',
    'hs-id-card-holder',
    'hs2-id-card-holder',
    'v2p-id-card-holder',
    'h4t-id-card-holder',
    'hs-t-id-card-holder',
    'h2t-id-card-holder',
    'v4t-id-card-holder',
    'h2-id-card-holder',
    'c2-id-card-holder',
    'v2h-id-card-holder',
    'h2h-id-card-holder',
    'v4-id-card-holder',
    'em4100-125khz-proximity-rfid-clamshell-thin-cards',
    'mifare-1k-classic-rfid-iso-smart-cards',
]

EMPTIED_CATEGORY_SLUGS = [
    'aluminium-metal-holder',
    'crystal-clear-pvc-id-card-holder',
    'executive-pvc-id-card-holder',
    'semi-transparent-pvc-id-card-holder',
    'pvc-id-card-sticker-pasting-holder',
]


def forwards(apps, schema_editor):
    remove_unlisted.remove(apps, REMOVED_PRODUCT_SLUGS, EMPTIED_CATEGORY_SLUGS)


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0008_rerun_remove_products_not_in_sheet'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
