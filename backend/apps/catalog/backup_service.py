import time
import logging
import threading
import gc
from datetime import datetime
from django.core.management import call_command
from django.db import reset_queries, close_old_connections

logger = logging.getLogger(__name__)

_backup_lock = threading.Lock()
_last_backup_time = 0
_MIN_BACKUP_INTERVAL = 10  # 10 seconds debounce for high responsiveness on enquiries and admin updates


def _execute_backup():
    global _last_backup_time
    if not _backup_lock.acquire(blocking=False):
        logger.info("[Cloud-Backup] Backup is already running in background, skipping redundant trigger.")
        return

    try:
        close_old_connections()
        reset_queries()
        logger.info(f"[Cloud-Backup] Starting persistent SQLite cloud backup at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}...")
        call_command('sync_sqlite_cloud', backup=True)
        _last_backup_time = time.time()
        logger.info("[Cloud-Backup] Database cloud backup completed successfully.")
    except Exception as e:
        logger.error(f"[Cloud-Backup] Backup error: {str(e)}")
    finally:
        try:
            close_old_connections()
            reset_queries()
            gc.collect()
        except Exception:
            pass
        _backup_lock.release()


def trigger_auto_backup_async(force=False):
    """
    Triggers an asynchronous SQLite cloud backup in a detached background thread.
    Debounced so rapid edits or concurrent customer enquiries do not thrash the CPU.
    """
    global _last_backup_time
    now = time.time()
    if not force and (now - _last_backup_time < _MIN_BACKUP_INTERVAL):
        logger.info(f"[Cloud-Backup] Throttled: last backup was {int(now - _last_backup_time)}s ago (min interval: {_MIN_BACKUP_INTERVAL}s).")
        return

    thread = threading.Thread(target=_execute_backup, daemon=True, name="CloudBackupThread")
    thread.start()
