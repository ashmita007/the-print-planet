import io
import shutil
import tempfile
from pathlib import Path
from unittest import mock

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient

from apps.catalog.local_images import SIZES, save_product_image
from apps.catalog.models import Category, Product, ProductImage


def png_bytes(size=(2000, 1000), mode='RGB'):
    out = io.BytesIO()
    Image.new(mode, size, (255, 0, 0, 0) if mode == 'RGBA' else 'red').save(out, format='PNG')
    return out.getvalue()


class LocalMediaTestCase(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, ignore_errors=True)
        patcher = override_settings(MEDIA_ROOT=self.media, FRONTEND_URL='https://shop.example')
        patcher.enable()
        self.addCleanup(patcher.disable)


class SaveProductImageTests(LocalMediaTestCase):
    def test_saves_webp_with_sized_copies_and_returns_public_url(self):
        url = save_product_image(png_bytes(), 'id-card')

        self.assertEqual(url, 'https://shop.example/media/products/id-card.webp')
        with Image.open(Path(self.media, 'products/id-card.webp')) as full:
            self.assertEqual((full.format, full.size), ('WEBP', (1600, 800)))
        for width in SIZES:
            with Image.open(Path(self.media, f'products/id-card.w{width}.webp')) as sized:
                self.assertEqual(sized.size, (width, width // 2))

    def test_keeps_transparency_and_does_not_overwrite_an_existing_image(self):
        first = save_product_image(png_bytes((100, 100), 'RGBA'), 'clip')
        second = save_product_image(png_bytes((100, 100), 'RGBA'), 'clip')

        self.assertNotEqual(first, second)
        name = second.rsplit('/', 1)[1][:-len('.webp')]
        self.assertTrue(Path(self.media, f'products/{name}.w480.webp').exists())
        with Image.open(Path(self.media, 'products/clip.webp')) as img:
            self.assertEqual(img.mode, 'RGBA')


class LocalizeProductImagesCommandTests(LocalMediaTestCase):
    def setUp(self):
        super().setUp()
        category = Category.objects.create(name='Cards', slug='cards')
        self.product = Product.objects.create(name='PVC Card', slug='pvc-card', sku='SKU-1', category=category)

    def test_moves_remote_images_and_skips_local_and_unreadable_ones(self):
        remote = ProductImage.objects.create(
            product=self.product, secure_url='https://res.cloudinary.com/x/image/upload/a.png',
            cloudinary_public_id='a', is_primary=True,
        )
        broken = ProductImage.objects.create(product=self.product, secure_url='https://res.cloudinary.com/x/b.png')
        local = ProductImage.objects.create(product=self.product, secure_url='https://shop.example/media/products/c.webp')

        def fake_download(url):
            return b'not an image' if url.endswith('b.png') else png_bytes()

        with mock.patch('apps.catalog.management.commands.localize_product_images.download', side_effect=fake_download) as dl:
            call_command('localize_product_images', stdout=io.StringIO())
            call_command('localize_product_images', stdout=io.StringIO())

        remote.refresh_from_db()
        self.assertEqual(remote.secure_url, f'https://shop.example/media/products/pvc-card-{remote.pk}.webp')
        self.assertEqual(remote.cloudinary_public_id, '')
        broken.refresh_from_db()
        self.assertEqual(broken.secure_url, 'https://res.cloudinary.com/x/b.png')
        local.refresh_from_db()
        self.assertEqual(local.secure_url, 'https://shop.example/media/products/c.webp')
        # The moved image is fetched once, the unreadable one is retried, the local one never.
        fetched = [c.args[0] for c in dl.call_args_list]
        self.assertEqual(fetched.count('https://res.cloudinary.com/x/image/upload/a.png'), 1)
        self.assertEqual(fetched.count('https://res.cloudinary.com/x/b.png'), 2)
        self.assertNotIn('https://shop.example/media/products/c.webp', fetched)

    def test_refuses_to_store_relative_urls(self):
        from django.core.management.base import CommandError
        with override_settings(FRONTEND_URL=''), self.assertRaises(CommandError):
            call_command('localize_product_images', stdout=io.StringIO())

    def test_dry_run_changes_nothing(self):
        image = ProductImage.objects.create(product=self.product, secure_url='https://res.cloudinary.com/x/a.png')
        with mock.patch('apps.catalog.management.commands.localize_product_images.download') as dl:
            call_command('localize_product_images', '--dry-run', stdout=io.StringIO())
        dl.assert_not_called()
        image.refresh_from_db()
        self.assertEqual(image.secure_url, 'https://res.cloudinary.com/x/a.png')


@override_settings(CLOUDINARY_CLOUD_NAME='', CLOUDINARY_API_KEY='', CLOUDINARY_API_SECRET='', R2_ACCESS_KEY_ID='')
class OwnerUploadLocalFallbackTests(LocalMediaTestCase):
    def test_local_upload_stores_sized_webp_copies(self):
        from django.contrib.auth import get_user_model
        admin = get_user_model().objects.create_superuser('boss', 'boss@example.com', 'x-pass-123')
        client = APIClient()
        client.force_authenticate(admin)

        response = client.post(
            '/api/v1/owner/images/upload/',
            {'file': SimpleUploadedFile('Gold Clip.png', png_bytes(), content_type='image/png')},
            format='multipart',
        )

        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.data['secure_url'], 'https://shop.example/media/products/gold-clip.webp')
        self.assertTrue(Path(self.media, 'products/gold-clip.w900.webp').exists())
