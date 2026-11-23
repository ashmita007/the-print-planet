"""
Keep only the items named in the owner's product sheet (Shrikanth.xlsx). On 23 Nov 2026 the owner
asked to drop the products kept under the sheet's blanket headings ("PVC Sheets", "Existing all
Rolls and other items", "All machines"): the PVC sheets, lanyard rolls, hooks, clamps,
sublimation paper and ink, and all machines. The 117 items named in the sheet (added in 0005) stay.

Same rules as 0007: match by slug, skip missing rows, delete a category only when it is empty.
Categories are deleted children first, so a parent emptied by this migration goes too.
"""
from django.db import migrations

REMOVED_PRODUCT_SLUGS = [
    '12-inch-x-100-m-x-80-gsm-sublimation-paper-roll',
    '16-mm-indian-maroon-colour-satin-lanyard-roll',
    '16-mm-indian-red-color-satin-lanyard-roll',
    '16-mm-indian-red-colour-satin-lanyard-roll',
    '16-mm-indian-yellow-colour-satin-lanyard-roll',
    '16mm-indian-black-colour-satin-lanyard-roll',
    '16mm-indian-orange-colour-satin-lanyard-roll',
    '16mm-indian-purple-colour-satin-lanyard-roll',
    '16mm-indian-royal-blue-colour-satin-lanyard-roll',
    '16mm-white-satin-roll-for-sublimation-printing',
    '1k-rfid-1356-mhz-a4-prelam-sheet-52-layout',
    '20-mm-indian-maroon-colour-satin-lanyard-roll',
    '20-mm-indian-navy-blue-colour-satin-lanyard-roll',
    '20-mm-indian-orange-colour-satin-lanyard-roll',
    '20-mm-indian-red-colour-satin-lanyard-roll',
    '20-mm-white-satin-roll-for-sublimation-printing',
    '20mm-indian-black-colour-satin-lanyard-roll',
    '20mm-indian-purple-colour-satin-lanyard-roll',
    '20mm-indian-red-color-satin-lanyard-roll',
    '20mm-indian-royal-blue-colour-satin-lanyard-roll',
    '20mm-indian-yellow-colour-satin-lanyard-roll',
    '24-inch-x-100-m-x-80-gsm-sublimation-paper-roll',
    '24-inch-x-50-m-x-80-gsm-sublimation-paper-roll',
    '25-mm-white-satin-roll-for-sublimation-printing',
    '40-inch-x-100-m-x-80-gsm-sublimation-paper-roll',
    '48-inch-x-100m-x-80-gsm-sublimation-paper',
    '4k-chip-135-mhz-a4-prelam-sheet-52-layout',
    '72-inch-x-150m-x-80-gsm-sublimation-paper',
    '8-inch-x-100-m-x-80-gsm-sublimation-paper-roll',
    'a3-digital-sheets-320-80',
    'a3-fusing-inkjet-sheets-300-100',
    'a4-fusing-inkjet-sheets-170-60',
    'a4-fusing-inkjet-sheets-300-100',
    'a4-inkjet-printable-pvc-core-sheet-sets-3-layer-kit',
    'a4-pvc-core-_200-mic',
    'a4-pvc-core-_320-mic',
    'a4-pvc-core_380-mic',
    'black-sublimation-ink',
    'clamp-fitting-machine-double-side-2-in-1',
    'clamp-fitting-machine-single-side',
    'coated-overlay-100-mic_-a3',
    'coated-overlay-100-mic_-a4',
    'coated-overlay-60-mic_-a3',
    'coated-overlay-60-mic_-a4',
    'coated-overlay-80-mic_-297-mm-x-480-mm',
    'coated-overlay-80-mic_-310-mm-x-470-mm',
    'coated-overlay-80-mic_-a3',
    'coated-overlay-80-mic_-a4',
    'custom-sublimation-heat-transfer-printed-lanyards-20mm',
    'cyan-sublimation-ink',
    'd-16mm-clamp-for-lanyards',
    'd-20mm-clamp-for-lanyards',
    'dct-1000-single-die-card-cutting-machine',
    'dct-150-a4-card-fusing-machine',
    'dct150-a4-pvc-card-making-fusing-machine',
    'dct2000-double-die-motorized-cutter',
    'dct2000-semi-automatic-double-die-id-card-cutter',
    'dct250-lanyard-heat-press-machine',
    'dct3000-card-cutting-machine',
    'dct400-a4-card-fusing-machine',
    'dct450-continuous-roll-lanyard-print-heat-press-machine',
    'dct450-lanyard-machine',
    'dct4500-fully-automatic-smart-id-card-cutting-machine',
    'digital-sheets-297-x-420-175-60',
    'digital-sheets-297-x-482-320-80',
    'digital-sheets-305-x-482-320-80',
    'felt-for-lanyard-machine',
    'gold-digital-sheet-a3-320-mic-80-mic',
    'keychain-ring',
    'lanyard-cutting-machine',
    'lanyards-plastic-hook-16-mm',
    'lanyards-plastic-hook-20-mm',
    'light-magenta-sublimation-ink',
    'm-12mm-clamp-for-lanyards',
    'm-16mm-clamp-for-lanyards',
    'm-20mm-clamp-for-lanyards',
    'm-25mm-clamp-for-lanyards',
    'ntag-216-nfc-a4-prelam-sheet-52-layout',
    'ovel-fish-hook-3g-16-mm',
    'ovel-fish-hook-3g-20-mm',
    'ovel-fish-hook-4g-16-mm',
    'ovel-fish-hook-4g-20-mm',
    'ovel-fish-hook-5g-16-mm',
    'ovel-fish-hook-5g-16-mm-1',
    'ovel-fish-hook-5g-20-mm',
    'proximity-chip-125-khz-a4-prelam-sheet-52-layout',
    'side-lever-dog-hook-16-mm',
    'side-lever-dog-hook-20-mm',
    'side-lever-hook-16mm_2g',
    'side-lever-hook-20mm_3g',
    'silicon-pad-for-fusing-machine',
    'silver-digital-sheet-a3-320-mic-80-mic',
    'ss-plates-220-x310',
    'twist-hook-16-mm',
    'twist-hook-20-mm',
    'uhf-1k-mirare-combo-a4-prelam-sheet-52-layout',
    'uhf-chip-800-mhz-a4-prelam-sheet-52-layout',
    'uhf-pro-combo-a4-prelam-sheet-52-layout',
    'ultrasonic-welding-machine',
    'wenlin-5p-industrial-water-chiller-for-laminators',
    'wenlin-8k-mirror-glossy-steel-lamination-plates',
    'wenlin-brushed-texture-steel-lamination-plate',
    'wenlin-fa5200at-10-automatic-laminator-jinguan',
    'wenlin-fa7500at-10-automatic-laminator-jinguan',
    'wenlin-fa7500at-10-automatic-transfer-laminator-yinguan',
    'wenlin-fa7500d-7-plastic-card-laminator',
    'wenlin-fa7500y10-oil-heating-automatic-card-laminator',
    'wenlin-frosted-steel-plates-for-plastic-card',
    'wenlin-new-full-auto-5600-smart-ic-card-laminator',
    'wenlin-new-full-auto-7500-laminating-machine',
    'wenlin-thermal-cushion-pad-for-card-laminator',
    'wenlin-xinguan-series-ipc-full-auto-ic-card-laminator',
    'wire-hook-12-mm',
    'wire-hook-16-mm',
    'wire-hook-20mm',
    'wl-8000t-automatic-card-hot-stamping-machine',
    'wl-acol800-sheet-collating-overlay-machine',
    'wl-bcj1200a-full-auto-magnetic-stripe-mounting-machine',
    'wl-hs-25a-card-collecting-punch-machine',
    'wl-hs-2a-a4-personalized-card-punching-machine',
    'wl-hs-2f-hydraulic-card-punching-machine',
    'wl-hs-3a-auto-servo-card-punching-machine',
    'wl-hs-3y-shaped-card-punching-machine',
    'wl-hsa-3c-fully-automatic-a3-plus-card-puncher',
    'yellow-sublimation-ink',
    'yoyo-reel',
]

EMPTIED_CATEGORY_SLUGS = [
    'automatic-pvc-smart-card-fusing-machine',
    'color-id-card-lanyard-roll',
    'digital-lanyard-white-roll',
    'digital-pvc-id-card-fusing-sheets',
    'fitting-metal-clamp-for-id-card-lanyards',
    'id-card-lanyard-consumables',
    'id-card-lanyard-hooks',
    'id-card-lanyard-hooks-fittings',
    'id-card-lanyard-making-support-machines',
    'id-card-lanyard-oval-fish-hook',
    'id-card-lanyard-side-lever-hook',
    'id-card-lanyard-wire-twist-hook',
    'id-card-manufacturing-machines',
    'indian-satin-digital-lanyard-roll',
    'lanyard-fitting-metal-clamp-for-id-card-lanyards',
    'lanyard-heat-press-fusing-machine',
    'lanyard-heat-press-machine',
    'machines',
    'motorized-pvc-id-card-cutting-machine-for-id-card',
    'other-card-lanyard-machines',
    'parts-accessories-for-machine',
    'plastic-lanyard-hook-clip-accessorie',
    'plastic-lanyard-hook-clip-accessories',
    'pvc-card-manual-fusing-machine-for-id-card',
    'pvc-id-card-inkjet-fusing-sheets',
    'rfid-cansumables',
    'rfid-inlay-prelam-sheet-for-smart-id-card',
    'rfid-smart-cards-and-consumables',
    'rfid-smart-cards-consumables',
    'sublimation-ink-for-lanyard-printing',
    'sublimation-paper-roll-for-lanyard-printing',
    'white-satin-digital-lanyard-roll',
]


def remove(apps, product_slugs, category_slugs):
    Category = apps.get_model('catalog', 'Category')
    Product = apps.get_model('catalog', 'Product')
    Product.objects.filter(slug__in=product_slugs).delete()
    removed = True
    while removed:
        removed = False
        for category in Category.objects.filter(slug__in=category_slugs):
            if not Product.objects.filter(category=category).exists() and not category.subcategories.exists():
                category.delete()
                removed = True


def forwards(apps, schema_editor):
    remove(apps, REMOVED_PRODUCT_SLUGS, EMPTIED_CATEGORY_SLUGS)


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0010_product_gst_rate_product_hsn_code_and_more'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
