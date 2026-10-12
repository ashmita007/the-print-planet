#!/usr/bin/env bash
set -e

echo "=== [The Print Planet] Starting Single-Unit Container ==="

# 1. Adapt Nginx port dynamically if PORT environment variable is specified (e.g. Render, Cloud Run, Railway)
TARGET_PORT="${PORT:-80}"
echo "-> Configuring Nginx to listen on port ${TARGET_PORT}..."
sed -i "s/listen [0-9]\+;/listen ${TARGET_PORT};/g" /etc/nginx/conf.d/default.conf

# 2. Database Migrations
echo "-> Applying database migrations..."
cd /app/backend
python manage.py migrate --noinput

# 3. Collect Static Files for Django Admin & API Docs
echo "-> Collecting static files for WhiteNoise/Nginx..."
python manage.py collectstatic --noinput || true

# 4. Seed Reference Catalog & Owner Admin Account
echo "-> Ensuring reference catalogue and default owner exist..."
python manage.py seed_reference_data --create-owner || true

# 5. Sync Media to Cloudinary CDN if credentials exist
if [ -n "$CLOUDINARY_URL" ] || [ -n "$CLOUDINARY_CLOUD_NAME" ]; then
    echo "-> Cloudinary credentials detected in environment, syncing media assets to CDN..."
    python manage.py sync_media_to_cloudinary || true
else
    echo "-> Skipping Cloudinary media sync (credentials not provided in environment)."
fi

echo "=== All services prepared! Launching supervisor (Django + Next.js + Nginx) ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
