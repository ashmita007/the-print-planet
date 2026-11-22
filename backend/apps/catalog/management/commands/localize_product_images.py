"""
Copy product images hosted elsewhere (Cloudinary, supplier sites) onto this server's disk
and point the catalogue at the local copies. Images already on this server are skipped, so
the command can be re-run after a partial failure.
"""
import ssl
import urllib.request

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from PIL import Image

from apps.catalog.local_images import save_product_image
from apps.catalog.models import ProductImage

MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024


def download(url):
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={'User-Agent': 'ThePrintPlanet/1.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
        data = response.read(MAX_DOWNLOAD_BYTES + 1)
    if len(data) > MAX_DOWNLOAD_BYTES:
        raise ValueError(f'larger than {MAX_DOWNLOAD_BYTES} bytes')
    return data


def is_remote(url):
    if not url.startswith(('http://', 'https://')):
        return False
    own_media = f'{settings.FRONTEND_URL}{settings.MEDIA_URL}'
    return not (settings.FRONTEND_URL and url.startswith(own_media))


class Command(BaseCommand):
    help = "Download remote product images to this server's disk and use the local copies."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='List the images that would be moved.')

    def handle(self, *args, **options):
        if not settings.FRONTEND_URL:
            raise CommandError('Set FRONTEND_URL or NEXT_PUBLIC_SITE_URL so image URLs are absolute.')
        images = [i for i in ProductImage.objects.select_related('product').order_by('id') if is_remote(i.secure_url)]
        self.stdout.write(f'{len(images)} remote product images found.')
        if options['dry_run']:
            for image in images:
                self.stdout.write(f'  {image.pk} {image.product.slug} {image.secure_url}')
            return

        moved, failed = 0, 0
        for image in images:
            try:
                url = save_product_image(download(image.secure_url), f'{image.product.slug[:80]}-{image.pk}')
            except (OSError, ValueError, SyntaxError, Image.DecompressionBombError) as exc:
                failed += 1
                self.stdout.write(self.style.WARNING(f'  skipped {image.pk} {image.secure_url}: {exc}'))
                continue
            ProductImage.objects.filter(pk=image.pk).update(secure_url=url, cloudinary_public_id='')
            moved += 1

        style = self.style.SUCCESS if not failed else self.style.WARNING
        self.stdout.write(style(f'Moved {moved} images to local storage, {failed} skipped.'))
