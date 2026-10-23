#!/usr/bin/env bash
set -e

echo "=== [The Print Planet] Starting Single-Unit Container ==="

# 1. Adapt Nginx port dynamically if PORT environment variable is specified (e.g. Render, Cloud Run, Railway)
TARGET_PORT="${PORT:-80}"
echo "-> Configuring Nginx to listen on port ${TARGET_PORT}..."
sed -i "s/listen [0-9]\+;/listen ${TARGET_PORT};/g" /etc/nginx/conf.d/default.conf

cd /app/backend

# 2. SQLite Proactive Self-Healing & Header Integrity Check (KashiiUpdatez Architecture)
echo "-> Validating SQLite database integrity..."
python -c "
import sqlite3, os
db_path = 'db.sqlite3'
if os.path.exists(db_path):
    is_corrupt = False
    reason = ''
    try:
        if os.path.getsize(db_path) == 0:
            is_corrupt = True
            reason = '0-byte empty file'
        else:
            with open(db_path, 'rb') as f:
                header = f.read(16)
            if header != b'SQLite format 3\x00':
                is_corrupt = True
                reason = f'invalid header: {header}'
            else:
                conn = sqlite3.connect(db_path)
                res = conn.execute('PRAGMA quick_check;').fetchone()
                conn.close()
                if not res or res[0] != 'ok':
                    is_corrupt = True
                    reason = f'quick_check failed: {res}'
    except Exception as e:
        is_corrupt = True
        reason = str(e)

    if is_corrupt:
        print(f'==> [Self-Healing] Corrupted SQLite file detected ({reason})! Purging corrupt artifacts...')
        for ext in ['', '-wal', '-shm', '-journal']:
            f = db_path + ext
            if os.path.exists(f):
                try:
                    os.remove(f)
                    print(f'==> Removed corrupt artifact: {f}')
                except Exception as del_err:
                    print(f'==> Could not remove {f}: {del_err}')
    else:
        print('==> SQLite database header & quick_check: 100% HEALTHY.')
else:
    print('==> Clean environment: No db.sqlite3 found. Will initialize fresh.')
"

# 3. Restore Persistent SQLite Cloud Backup from Cloudinary (if available)
echo "-> Checking Cloudinary for persistent SQLite database backup..."
python manage.py sync_sqlite_cloud --restore || true

# 4. Run database migrations with resilient retry loop
echo "-> Applying database migrations..."
for i in {1..5}; do
  if python manage.py migrate --noinput; then
    echo "-> Migrations applied successfully."
    break
  else
    echo "-> Migration attempt $i failed. Retrying in 3s..."
    sleep 3
    if [ "$i" -eq 5 ]; then
      echo "-> Final migration retry: ensuring WAL locks are cleared..."
      sqlite3 db.sqlite3 "PRAGMA wal_checkpoint(TRUNCATE);" || true
      python manage.py migrate --noinput
    fi
  fi
done

# 5. Collect Static Files for WhiteNoise/Nginx
echo "-> Collecting static files for WhiteNoise/Nginx..."
python manage.py collectstatic --noinput || true

# 6. Initialize Database Catalogue (Ensures all 186 verified wholesale products exist; never deletes custom data)
echo "-> Checking and initializing database catalogue & owner accounts..."
python manage.py seed_reference_data --create-owner || true

# 7. Post-boot SQLite Cloud Backup (Saves fresh state & any owner changes to Cloudinary)
echo "-> Backing up initialized SQLite snapshot to Cloudinary..."
python manage.py sync_sqlite_cloud --backup || true

# 8. Sync Media to Cloudflare R2 or Cloudinary CDN if credentials exist
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
