"""
Replace product photos with new images from a folder of "<product-slug>.<png|jpg|webp>" files.

For each file whose slug matches a product, the new image is saved first (WebP plus sized
copies, see local_images), then the product's old image rows are deleted and their files on
this server's disk removed. A product whose new file cannot be read keeps its old photo.
"""
import os
from pathlib import Path

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from PIL import Image

from apps.catalog.local_images import SIZES, save_product_image
from apps.catalog.models import Product, ProductImage

EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp')


def local_media_name(url):
    """The storage name for an image URL on this server, or '' for anything hosted elsewhere."""
    prefix = f'{settings.FRONTEND_URL}{settings.MEDIA_URL}'
    if settings.FRONTEND_URL and url.startswith(prefix):
        return url[len(prefix):]
    if url.startswith(settings.MEDIA_URL):
        return url[len(settings.MEDIA_URL):]
    return ''


def delete_local_files(url):
    name = local_media_name(url)
    if not name or '..' in name:
        return
    names = [name]
    if name.endswith('.webp'):
        names += [f'{name[:-5]}.w{width}.webp' for width in SIZES]
    for n in names:
        if default_storage.exists(n):
            default_storage.delete(n)


class Command(BaseCommand):
    help = 'Replace product photos with the images in a folder named by product slug.'

    def add_arguments(self, parser):
        parser.add_argument('folder')
        parser.add_argument('--dry-run', action='store_true')

    def handle(self, folder, **options):
        if not settings.FRONTEND_URL:
            raise CommandError('Set FRONTEND_URL or NEXT_PUBLIC_SITE_URL so image URLs are absolute.')
        root = Path(folder)
        if not root.is_dir():
            raise CommandError(f'{folder} is not a folder.')
        files = {}
        for path in sorted(root.iterdir()):
            if path.suffix.lower() not in EXTENSIONS:
                continue
            if path.stem in files:
                raise CommandError(f'Two images for {path.stem}: {files[path.stem].name} and {path.name}.')
            files[path.stem] = path
        products = {p.slug: p for p in Product.objects.filter(slug__in=files)}
        unknown = sorted(set(files) - set(products))
        self.stdout.write(f'{len(products)} products to update, {len(unknown)} files match no product.')
        for slug in unknown:
            self.stdout.write(self.style.WARNING(f'  no product: {slug}'))
        if options['dry_run']:
            return

        replaced = failed = 0
        for slug, product in sorted(products.items()):
            try:
                url = save_product_image(files[slug].read_bytes(), f'{slug[:80]}-{os.urandom(3).hex()}')
            except (OSError, ValueError, SyntaxError, Image.DecompressionBombError) as exc:
                failed += 1
                self.stdout.write(self.style.WARNING(f'  kept old photo for {slug}: {exc}'))
                continue
            with transaction.atomic():
                old = list(product.images.all())
                ProductImage.objects.create(product=product, secure_url=url, alt_text=product.name[:255],
                                            display_order=0, is_primary=True)
                ProductImage.objects.filter(pk__in=[i.pk for i in old]).delete()
            for image in old:
                try:
                    delete_local_files(image.secure_url)
                except OSError as exc:
                    self.stdout.write(self.style.WARNING(f'  could not delete old file {image.secure_url}: {exc}'))
            replaced += 1

        style = self.style.SUCCESS if not failed else self.style.WARNING
        self.stdout.write(style(f'Replaced photos for {replaced} products, {failed} kept their old photo.'))
