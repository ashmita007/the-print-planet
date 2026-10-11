#!/usr/bin/env bash
# ==============================================================================
# The Print Planet — Seed Images Downloader & Database Associator
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
DATA_FILE="${SCRIPT_DIR}/data/reference-products.json"
MEDIA_DIR="${BACKEND_DIR}/media/products"

echo "=== [The Print Planet] Seeding Reference Images Locally ==="

mkdir -p "${MEDIA_DIR}"

# Run image download and database re-seeding
if [ -f "${BACKEND_DIR}/venv/bin/python" ]; then
    PYTHON_CMD="${BACKEND_DIR}/venv/bin/python"
else
    PYTHON_CMD="python3"
fi

echo "-> Downloading authentic reference images into ${MEDIA_DIR}..."
${PYTHON_CMD} -c "
import json, ssl, urllib.request
from pathlib import Path

media_dir = Path('${MEDIA_DIR}')
media_dir.mkdir(parents=True, exist_ok=True)

with open('${DATA_FILE}') as f:
    data = json.load(f)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

products = data.get('products', [])
downloaded = 0
failed = 0

for p in products:
    url = p.get('image_url')
    if not url:
        continue
    sku = p.get('sku')
    ext = url.split('.')[-1].split('?')[0] or 'png'
    dest = media_dir / f'{sku}.{ext}'
    if dest.exists() and dest.stat().st_size > 0:
        downloaded += 1
        continue
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            dest.write_bytes(r.read())
        downloaded += 1
    except Exception as e:
        failed += 1
        print(f'Failed {sku}: {e}')

print(f'-> Image download complete! Cached/Downloaded: {downloaded}, Failed: {failed}')
"

echo "-> Associating local images with database products..."
cd "${BACKEND_DIR}"
${PYTHON_CMD} manage.py seed_reference_data

echo "=== [The Print Planet] All Seed Images Verified and Ready Locally! ==="
