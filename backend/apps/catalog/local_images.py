"""
Product images kept on the server's own disk (MEDIA_ROOT), served by Nginx from /media/.

Each image is stored once as WebP (longest side at most MAX_SIDE) plus one smaller WebP copy
per width in SIZES, named "<name>.w<width>.webp". The storefront asks for those widths
(see sizedImage in frontend/src/lib/formatters.ts), so pages never download the full image
and the server never resizes at request time.
"""
import io

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image

SIZES = (160, 480, 900)
MAX_SIDE = 1600
QUALITY = 82
FOLDER = 'products'


def _webp(img, width=None):
    if width and img.width > width:
        img = img.resize((width, max(1, round(img.height * width / img.width))), Image.Resampling.LANCZOS)
    out = io.BytesIO()
    img.save(out, format='WEBP', quality=QUALITY, method=6)
    return ContentFile(out.getvalue())


def save_product_image(data, stem):
    """
    Save image bytes as WebP with its sized copies and return the image's public URL.
    Raises PIL.UnidentifiedImageError (an OSError) when the bytes are not a readable image.
    """
    img = Image.open(io.BytesIO(data))
    img.load()
    has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
    img = img.convert('RGBA' if has_alpha else 'RGB')
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)

    # default_storage picks a free name if this one is taken, so derive the copies from it.
    name = default_storage.save(f'{FOLDER}/{stem}.webp', _webp(img))
    base = name[:-len('.webp')]
    for width in SIZES:
        sized = f'{base}.w{width}.webp'
        if default_storage.exists(sized):
            default_storage.delete(sized)
        default_storage.save(sized, _webp(img, width))
    return f'{settings.FRONTEND_URL}{settings.MEDIA_URL}{name}'
