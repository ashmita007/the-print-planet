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
