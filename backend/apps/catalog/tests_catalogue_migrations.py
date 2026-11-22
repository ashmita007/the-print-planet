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
