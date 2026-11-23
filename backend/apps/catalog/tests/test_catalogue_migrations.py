import os
from importlib import import_module

from django.apps import apps
from django.test import TestCase

from apps.catalog.models import Category, Product, ProductImage

sheet = import_module('apps.catalog.migrations.0005_sheet_catalogue_products')
ai_images = import_module('apps.catalog.migrations.0006_ai_product_images')


class SheetCatalogueMigrationTests(TestCase):
    def test_creates_sheet_categories_and_quote_only_products(self):
        sheet.forwards(apps, None)

        lanyards = Category.objects.get(slug='lanyards')
        self.assertEqual(lanyards.parent.slug, 'id-card-accessories')
        self.assertEqual(lanyards.name, 'LANYARDS')

        wipes = Product.objects.get(slug='pre-moistened-lens-wipes')
        self.assertEqual(wipes.category.slug, 'lens-cleaning-solutions')
        self.assertIsNone(wipes.price)
        self.assertIsNone(wipes.minimum_order_quantity)
        self.assertIn('supplied by The Print Planet', wipes.short_description)
        self.assertIn('Spot UV by The Print Planet', Product.objects.get(slug='spot-uv').short_description)

    def test_skips_products_whose_category_is_missing(self):
        sheet.forwards(apps, None)
        # id-card-holder is not created by the migration, so its products are skipped here.
        self.assertFalse(Product.objects.filter(slug='vertical-card-holders').exists())

    def test_rerun_keeps_owner_edits_and_adds_no_duplicates(self):
        sheet.forwards(apps, None)
        Product.objects.filter(slug='business-cards').update(name='Owner Edited Name', price=500)
        count = Product.objects.count()

        sheet.forwards(apps, None)

        self.assertEqual(Product.objects.count(), count)
        edited = Product.objects.get(slug='business-cards')
        self.assertEqual(edited.name, 'Owner Edited Name')
        self.assertEqual(edited.price, 500)


class AiProductImagesMigrationTests(TestCase):
    def test_replaces_old_images_with_one_new_primary_and_is_idempotent(self):
        slug, url = next(iter(ai_images.IMAGES.items()))
        category = Category.objects.create(name='Holders', slug='holders-test')
        product = Product.objects.create(name='Holder', slug=slug, sku='SKU-AI-1', category=category)
        ProductImage.objects.create(product=product, secure_url='https://old.example/a.jpg', is_primary=True)
        ProductImage.objects.create(product=product, secure_url='https://old.example/b.jpg')

        ai_images.forwards(apps, None)
        ai_images.forwards(apps, None)

        images = list(product.images.all())
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0].secure_url, url)
        self.assertTrue(images[0].is_primary)
        self.assertEqual(images[0].cloudinary_public_id, f'the_print_planet/products-ai/{slug}')


remove_unlisted = import_module('apps.catalog.migrations.0007_remove_products_not_in_sheet')
remove_old_holders = import_module('apps.catalog.migrations.0009_remove_old_holders_and_cards')
named_only = import_module('apps.catalog.migrations.0011_keep_only_named_sheet_items')


class RemoveProductsNotInSheetMigrationTests(TestCase):
    def test_removes_unlisted_products_and_their_empty_categories_only(self):
        sample = Category.objects.create(name='Sample Kit', slug='sample-kit')
        gumming = Category.objects.create(name='Gumming', slug='gumming-roll-for-sticker-card')
        holders = Category.objects.create(name='Holders', slug='aluminium-metal-holder')
        removed = Product.objects.create(name='Sample Kit Holder', slug='sample-kit-holder', sku='S-1', category=sample)
        ProductImage.objects.create(product=removed, secure_url='https://old.example/s.jpg', is_primary=True)
        Product.objects.create(name='Gpps', slug='gpps', sku='S-2', category=holders)
        Product.objects.create(name='Sensui', slug='sensui-12-inch-x-50-mitter-roll', sku='S-3', category=gumming)
        # An owner-added product keeps its category alive.
        Product.objects.create(name='New Gumming Roll', slug='new-gumming-roll', sku='S-4', category=gumming)
        kept = Product.objects.create(name='Gold Vertical', slug='gold-vertical-aluminium-holder', sku='S-5', category=holders)

        remove_unlisted.forwards(apps, None)
        remove_unlisted.forwards(apps, None)

        self.assertFalse(Product.objects.filter(slug__in=remove_unlisted.REMOVED_PRODUCT_SLUGS).exists())
        self.assertFalse(ProductImage.objects.filter(secure_url='https://old.example/s.jpg').exists())
        self.assertFalse(Category.objects.filter(slug='sample-kit').exists())
        self.assertTrue(Category.objects.filter(slug='gumming-roll-for-sticker-card').exists())
        self.assertTrue(Product.objects.filter(pk=kept.pk).exists())


class SeedReferenceDataTests(TestCase):
    def test_seed_does_not_recreate_removed_categories(self):
        from django.core.management import call_command

        call_command('seed_reference_data', stdout=open(os.devnull, 'w'))

        for migration in (remove_unlisted, remove_old_holders, named_only):
            self.assertFalse(Category.objects.filter(slug__in=migration.EMPTIED_CATEGORY_SLUGS).exists())
            self.assertFalse(Product.objects.filter(slug__in=migration.REMOVED_PRODUCT_SLUGS).exists())


class RemoveOldHoldersAndCardsMigrationTests(TestCase):
    def test_removes_old_models_and_keeps_sheet_items(self):
        parent, _ = Category.objects.get_or_create(slug='id-card-holder', defaults={'name': 'ID Card Holder'})
        executive, _ = Category.objects.update_or_create(
            slug='executive-pvc-id-card-holder', defaults={'name': 'Executive', 'parent': parent},
        )
        cards, _ = Category.objects.get_or_create(slug='pvc-and-smart-cards', defaults={'name': 'Cards'})
        Product.objects.create(name='EH-T', slug='eh-t-executive-pvc-id-card-holder', sku='H-1', category=executive)
        Product.objects.create(name='MIFARE', slug='mifare-1k-classic-rfid-iso-smart-cards', sku='H-2', category=cards)
        sheet_holder = Product.objects.create(name='Vertical', slug='vertical-card-holders', sku='H-3', category=parent)
        sheet_card = Product.objects.create(name='RFID and NFC Cards', slug='rfid-and-nfc-cards', sku='H-4', category=cards)

        remove_old_holders.forwards(apps, None)

        self.assertFalse(Product.objects.filter(slug__in=remove_old_holders.REMOVED_PRODUCT_SLUGS).exists())
        self.assertFalse(Category.objects.filter(slug='executive-pvc-id-card-holder').exists())
        self.assertTrue(Category.objects.filter(slug='id-card-holder').exists())
        self.assertEqual(Product.objects.filter(pk__in=[sheet_holder.pk, sheet_card.pk]).count(), 2)


class KeepOnlyNamedSheetItemsMigrationTests(TestCase):
    def test_removes_blanket_group_products_and_emptied_parent_categories(self):
        machines, _ = Category.objects.update_or_create(slug='machines', defaults={'name': 'Machines'})
        id_machines, _ = Category.objects.update_or_create(
            slug='id-card-manufacturing-machines', defaults={'name': 'ID Machines', 'parent': machines},
        )
        consumables, _ = Category.objects.get_or_create(slug='pvc-id-card-consumable', defaults={'name': 'Consumables'})
        core, _ = Category.objects.update_or_create(
            slug='pvc-core-sheets-for-id-card-printing', defaults={'name': 'Core sheets', 'parent': consumables},
        )
        Product.objects.create(
            name='DCT150', slug='dct150-a4-pvc-card-making-fusing-machine', sku='M-1', category=id_machines,
        )
        named_sheet = Product.objects.create(
            name='PVC Core Sheet', slug='pvc-core-sheet-483-x-305-x-032-mm', sku='M-2', category=core,
        )

        named_only.forwards(apps, None)

        self.assertFalse(Product.objects.filter(slug='dct150-a4-pvc-card-making-fusing-machine').exists())
        self.assertFalse(Category.objects.filter(slug__in=['machines', 'id-card-manufacturing-machines']).exists())
        self.assertTrue(Product.objects.filter(pk=named_sheet.pk).exists())
        self.assertEqual(Category.objects.filter(slug__in=['pvc-id-card-consumable', core.slug]).count(), 2)
