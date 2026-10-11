#!/usr/bin/env bash
set -e

echo "=== [The Print Planet] Starting Single-Unit Container ==="

# 1. Adapt Nginx port dynamically if PORT environment variable is specified (e.g., Cloud Run, Heroku, Railway)
TARGET_PORT="${PORT:-80}"
echo "-> Configuring Nginx to listen on port ${TARGET_PORT}..."
sed -i "s/listen [0-9]\+;/listen ${TARGET_PORT};/g" /etc/nginx/conf.d/default.conf

# 2. Database Migrations
echo "-> Applying database migrations..."
cd /app/backend
python manage.py migrate --noinput

# 3. Seed Reference Catalog & Owner Admin Account
echo "-> Ensuring reference catalogue and default owner exist..."
python manage.py seed_reference_data --create-owner

echo "=== All services prepared! Launching supervisor (Django + Next.js + Nginx) ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
