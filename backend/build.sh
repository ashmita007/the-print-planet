#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=========================================================="
echo " Starting The Print Planet Backend Build Process (Render) "
echo "=========================================================="

echo "--> Upgrading pip and installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 1. Proactive SQLite self-healing integrity check (KashiiUpdatez Architecture)
echo "--> Validating SQLite database integrity..."
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

# 2. Restore Cloudinary Cloud Backup (if available)
echo "--> Checking Cloudinary for persistent SQLite database backup..."
python manage.py sync_sqlite_cloud --restore || true

# 3. Applying database migrations with resilient retry loop
echo "--> Applying database migrations..."
for i in {1..5}; do
  if python manage.py migrate --noinput; then
    echo "--> Migrations applied successfully."
    break
  else
    echo "--> Migration attempt $i failed. Retrying in 3s..."
    sleep 3
    if [ "$i" -eq 5 ]; then
      echo "--> Final migration retry: ensuring locks are cleared..."
      sqlite3 db.sqlite3 "PRAGMA wal_checkpoint(TRUNCATE);" || true
      python manage.py migrate --noinput
    fi
  fi
done

echo "--> Collecting static files for WhiteNoise..."
python manage.py collectstatic --noinput

# 4. Ensure initial product catalogue is seeded
echo "--> Ensuring product catalogue & owner accounts are initialized..."
python manage.py seed_reference_data --create-owner || true

# 5. Backup snapshot to Cloudinary
echo "--> Uploading latest SQLite snapshot to Cloudinary cloud backup..."
python manage.py sync_sqlite_cloud --backup || true

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
