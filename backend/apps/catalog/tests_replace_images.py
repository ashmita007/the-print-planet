import io
import shutil
import tempfile
from pathlib import Path

from django.core.files.storage import default_storage
from django.core.management import call_command
from django.test import TestCase, override_settings
from PIL import Image

from apps.catalog.local_images import save_product_image
from apps.catalog.models import Category, Product, ProductImage


def png_bytes(color=(10, 120, 200)):
    out = io.BytesIO()
    Image.new('RGB', (40, 30), color).save(out, format='PNG')
    return out.getvalue()


class ReplaceProductImagesTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.folder = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.media, True)
        self.addCleanup(shutil.rmtree, self.folder, True)
        self.override = override_settings(MEDIA_ROOT=self.media, FRONTEND_URL='https://shop.example')
        self.override.enable()
        self.addCleanup(self.override.disable)
        cat = Category.objects.create(name='Cards', slug='cards')
        self.product = Product.objects.create(name='Blue Card', slug='blue-card', category=cat)
        self.old_url = save_product_image(png_bytes((200, 0, 0)), 'blue-card-old')
        self.old = ProductImage.objects.create(product=self.product, secure_url=self.old_url, is_primary=True)
        self.remote = ProductImage.objects.create(product=self.product, secure_url='https://cdn.example/x.jpg')

    def test_replaces_rows_and_removes_old_local_files(self):
        (self.folder / 'blue-card.png').write_bytes(png_bytes())
        call_command('replace_product_images', str(self.folder), stdout=io.StringIO())
        images = list(self.product.images.all())
        self.assertEqual(len(images), 1)
        self.assertTrue(images[0].is_primary)
        self.assertTrue(images[0].secure_url.startswith('https://shop.example/media/products/blue-card-'))
        old_name = self.old_url.split('/media/')[1]
        self.assertFalse(default_storage.exists(old_name))
        self.assertFalse(default_storage.exists(old_name.replace('.webp', '.w480.webp')))
        new_name = images[0].secure_url.split('/media/')[1]
        self.assertTrue(default_storage.exists(new_name.replace('.webp', '.w160.webp')))

    def test_unreadable_file_keeps_old_photo(self):
        (self.folder / 'blue-card.png').write_bytes(b'not an image')
        call_command('replace_product_images', str(self.folder), stdout=io.StringIO())
        self.assertEqual(self.product.images.count(), 2)
        self.assertTrue(default_storage.exists(self.old_url.split('/media/')[1]))

    def test_dry_run_and_unknown_slugs_change_nothing(self):
        (self.folder / 'blue-card.png').write_bytes(png_bytes())
        (self.folder / 'no-such-product.png').write_bytes(png_bytes())
        out = io.StringIO()
        call_command('replace_product_images', str(self.folder), '--dry-run', stdout=out)
        self.assertIn('1 files match no product', out.getvalue())
        self.assertEqual(self.product.images.count(), 2)

    def test_remote_urls_are_never_touched(self):
        from apps.catalog.management.commands.replace_product_images import local_media_name
        self.assertEqual(local_media_name('https://cdn.example/x.jpg'), '')
        self.assertEqual(local_media_name('https://shop.example/media/products/a.webp'), 'products/a.webp')

