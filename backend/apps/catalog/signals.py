import time
import logging
import threading
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.management import call_command
from .models import Product, Category, ProductImage
from apps.enquiries.models import Enquiry

logger = logging.getLogger(__name__)

_backup_lock = threading.Lock()
_last_sync_time = 0


def _debounced_cloud_sync():
    global _last_sync_time
    with _backup_lock:
        now = time.time()
        if now - _last_sync_time < 8:
            return
        _last_sync_time = now

    time.sleep(2)
    try:
        call_command('sync_sqlite_cloud', backup=True)
        logger.info("Successfully completed automated debounced SQLite cloud sync.")
    except Exception as e:
        logger.warning(f"Automated SQLite cloud sync encountered: {e}")


def schedule_auto_cloud_sync():
    thread = threading.Thread(target=_debounced_cloud_sync, daemon=True)
    thread.start()


@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
@receiver(post_save, sender=Enquiry)
def auto_sync_on_database_mutation(sender, **kwargs):
    schedule_auto_cloud_sync()
