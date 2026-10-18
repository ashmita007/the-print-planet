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

# 4. Initialize Database (Site Settings, Owner Accounts, Optional Categories)
echo "-> Initializing database essentials (Site Settings, Owner Accounts)..."
if [ "$SEED_PRODUCTS" = "True" ] || [ "$SEED_PRODUCTS" = "true" ]; then
    echo "-> SEED_PRODUCTS=True: Seeding full catalogue with reference products..."
    python manage.py seed_reference_data --create-owner || true
elif [ "$SEED_CATEGORIES" = "True" ] || [ "$SEED_CATEGORIES" = "true" ]; then
    echo "-> SEED_CATEGORIES=True: Seeding standard reference categories..."
    python manage.py seed_reference_data --categories-only --create-owner || true
else
    echo "-> Blank Slate Mode: Initializing owners & site settings with ZERO categories and ZERO products..."
    python manage.py seed_reference_data --init-owners-only --create-owner || true
fi

# 5. Sync Media to Cloudflare R2 or Cloudinary CDN if credentials exist
if [ -n "$R2_ACCESS_KEY_ID" ] && [ -n "$R2_SECRET_ACCESS_KEY" ]; then
    echo "-> Cloudflare R2 credentials detected, syncing media assets to Cloudflare R2..."
    python manage.py sync_media_to_cloudflare_r2 || true
elif [ -n "$CLOUDINARY_URL" ] || [ -n "$CLOUDINARY_CLOUD_NAME" ]; then
    echo "-> Cloudinary credentials detected, syncing media assets to Cloudinary CDN..."
    python manage.py sync_media_to_cloudinary || true
else
    echo "-> Using local high-speed Nginx media storage (zero cost, zero external service dependency)."
fi

echo "=== All services prepared! Launching supervisor (Django + Next.js + Nginx) ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
