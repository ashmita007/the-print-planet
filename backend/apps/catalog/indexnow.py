"""
IndexNow: tell Bing, Yandex, Seznam, Naver and Yep that catalogue pages changed so they recrawl sooner.
Google does not use IndexNow. Changes are collected for a few seconds and sent as one request, so a
bulk CSV import makes one call instead of hundreds.
"""
import json
import logging
import os
import threading

import urllib3
from django.conf import settings

logger = logging.getLogger(__name__)

# The key is public by design: the same value is served at https://<site>/<key>.txt.
DEFAULT_KEY = 'fd2b80eeb4b145299c37b412906dccf6'
FLUSH_AFTER_SECONDS = 15
MAX_URLS = 10000

_pending: set[str] = set()
_lock = threading.Lock()
_timer: threading.Timer | None = None
_http = urllib3.PoolManager(timeout=urllib3.Timeout(connect=5.0, read=10.0), retries=False)


def _site_url() -> str:
    return (getattr(settings, 'FRONTEND_URL', '') or 'https://theprintplanet.co.in').rstrip('/')


def _enabled() -> bool:
    if os.environ.get('INDEXNOW_DISABLED', '').lower() in ('1', 'true', 'yes'):
        return False
    # Never ping from a developer machine: local slugs may not exist on the live site.
    return not settings.DEBUG and _site_url().startswith('https://')


def _flush() -> None:
    global _timer
    with _lock:
        urls = sorted(_pending)[:MAX_URLS]
        _pending.clear()
        _timer = None
    if not urls:
        return
    site = _site_url()
    key = os.environ.get('INDEXNOW_KEY', DEFAULT_KEY)
    body = {
        'host': site.split('://', 1)[1],
        'key': key,
        'keyLocation': f'{site}/{key}.txt',
        'urlList': urls,
    }
    try:
        resp = _http.request(
            'POST',
            'https://api.indexnow.org/indexnow',
            body=json.dumps(body).encode('utf-8'),
            headers={'Content-Type': 'application/json; charset=utf-8'},
        )
        # 200 = accepted, 202 = accepted and key check pending.
        if resp.status in (200, 202):
            logger.info('IndexNow accepted %d URLs', len(urls))
        else:
            logger.warning('IndexNow returned HTTP %s for %d URLs', resp.status, len(urls))
    except Exception as exc:  # network trouble must never affect saving products
        logger.warning('IndexNow ping failed: %s', exc.__class__.__name__)


def queue_paths(*paths: str) -> None:
    """Queue site paths such as '/products/abc' for the next IndexNow batch."""
    global _timer
    if not _enabled():
        return
    site = _site_url()
    with _lock:
        for path in paths:
            if path:
                _pending.add(f"{site}/{path.lstrip('/')}" if path != '/' else f'{site}/')
        if _timer is None:
            _timer = threading.Timer(FLUSH_AFTER_SECONDS, _flush)
            _timer.daemon = True
            _timer.start()
