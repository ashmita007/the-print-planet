"""
Data migration to merge duplicate categories and delete 0-item duplicates:
1. Merge duplicate 'white-satin-digital-lanyard-roll' into 'digital-lanyard-white-roll'.
2. Delete empty duplicate 'lanyard-fitting-metal-clamp-for-id-card-lanyards' (0 items).
3. Delete empty duplicate 'automatic-pvc-smart-card-fusing-machine' (0 items).
4. Ensure 'aluminium-metal-holder' has parent 'id-card-holder'.
"""
from django.db import migrations


def merge_and_cleanup_duplicates(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    Product = apps.get_model('catalog', 'Product')

    # 1. Merge white-satin-digital-lanyard-roll into digital-lanyard-white-roll
    target_white = Category.objects.filter(slug='digital-lanyard-white-roll').first()
    dup_white = Category.objects.filter(slug='white-satin-digital-lanyard-roll').first()
    if target_white and dup_white:
        Product.objects.filter(category=dup_white).update(category=target_white)
        dup_white.delete()

    # 2. Delete empty duplicate clamp category
    dup_clamp = Category.objects.filter(slug='lanyard-fitting-metal-clamp-for-id-card-lanyards').first()
    if dup_clamp:
        # Move any products if any exist to fitting-metal-clamp-for-id-card-lanyards
        target_clamp = Category.objects.filter(slug='fitting-metal-clamp-for-id-card-lanyards').first()
        if target_clamp:
            Product.objects.filter(category=dup_clamp).update(category=target_clamp)
        dup_clamp.delete()

    # 3. Delete empty fusing machine duplicate
    dup_fusing = Category.objects.filter(slug='automatic-pvc-smart-card-fusing-machine').first()
    if dup_fusing:
        target_fusing = Category.objects.filter(slug='id-card-manufacturing-machines').first()
        if target_fusing:
            Product.objects.filter(category=dup_fusing).update(category=target_fusing)
        dup_fusing.delete()

    # 4. Set parent of aluminium-metal-holder to id-card-holder
    holder_parent = Category.objects.filter(slug='id-card-holder').first()
    alum_holder = Category.objects.filter(slug='aluminium-metal-holder').first()
    if holder_parent and alum_holder:
        alum_holder.parent = holder_parent
        alum_holder.save(update_fields=['parent'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0003_seo_catalogue_cleanup'),
    ]

    operations = [
        migrations.RunPython(merge_and_cleanup_duplicates, noop_reverse),
    ]
