#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=========================================================="
echo " Starting The Print Planet Backend Build Process (Render) "
echo "=========================================================="

echo "--> Upgrading pip and installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "--> Applying database migrations..."
python manage.py migrate --noinput

echo "--> Collecting static files for WhiteNoise..."
python manage.py collectstatic --noinput

echo "--> Ensuring initial product catalogue is seeded..."
python manage.py seed_reference_data || true

# If Cloudinary credentials are provided, sync images to CDN
if [ -n "$CLOUDINARY_URL" ] || [ -n "$CLOUDINARY_CLOUD_NAME" ]; then
    echo "--> Syncing local media assets to Cloudinary CDN..."
    python manage.py sync_media_to_cloudinary || true
else
    echo "--> Skipping Cloudinary sync (credentials not provided in environment)."
fi

echo "=========================================================="
echo " Backend Build Process Complete! Ready to serve.         "
echo "=========================================================="
