"""
Re-run 0007. On the first deploy, the boot-time seed (seed_reference_data) re-created the
emptied categories from data/reference-products.json; that file no longer lists them.
"""
from importlib import import_module

from django.db import migrations

remove_unlisted = import_module('apps.catalog.migrations.0007_remove_products_not_in_sheet')


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0007_remove_products_not_in_sheet'),
    ]

    operations = [
        migrations.RunPython(remove_unlisted.forwards, migrations.RunPython.noop),
    ]
