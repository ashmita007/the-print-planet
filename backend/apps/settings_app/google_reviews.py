"""Fetches the business's real rating and latest reviews from the Google Places API (New)."""
import json
import os
import re
from datetime import timedelta

import urllib3
from django.utils import timezone

from .models import GoogleReviewConnection

# Place IDs are URL-safe tokens; anything else is rejected so it cannot alter the request path.
PLACE_ID_RE = re.compile(r'^[A-Za-z0-9_-]{10,255}$')
FIELD_MASK = 'rating,userRatingCount,reviews,googleMapsUri,displayName'
REFRESH_AFTER = timedelta(hours=24)

_http = urllib3.PoolManager(timeout=urllib3.Timeout(connect=4.0, read=6.0), retries=False)


def api_key_for(conn: GoogleReviewConnection) -> str:
    return (os.environ.get('GOOGLE_PLACES_API_KEY') or conn.places_api_key or '').strip()


def is_valid_place_id(place_id: str) -> bool:
    return bool(PLACE_ID_RE.match(place_id or ''))


def _clean_review(r: dict) -> dict:
    author = r.get('authorAttribution') or {}
    text = (r.get('originalText') or r.get('text') or {}).get('text', '')
    return {
        'author_name': str(author.get('displayName', ''))[:120],
        'author_url': str(author.get('uri', ''))[:500],
        'author_photo': str(author.get('photoUri', ''))[:500],
        'rating': int(r.get('rating') or 0),
        'text': str(text)[:1500],
        'relative_time': str(r.get('relativePublishTimeDescription', ''))[:60],
        'publish_time': str(r.get('publishTime', ''))[:40],
    }


def sync_reviews(conn: GoogleReviewConnection) -> tuple[bool, str]:
    """Refresh the cached rating and reviews. Returns (ok, message)."""
    key = api_key_for(conn)
    if not conn.place_id:
        return False, 'Add your Google Place ID first.'
    if not is_valid_place_id(conn.place_id):
        return False, 'That Place ID does not look right. It usually starts with "ChIJ".'
    if not key:
        return False, 'Add a Google Places API key (or set GOOGLE_PLACES_API_KEY on the server).'

    try:
        resp = _http.request(
            'GET',
            f'https://places.googleapis.com/v1/places/{conn.place_id}',
            headers={'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELD_MASK},
        )
        data = json.loads(resp.data.decode('utf-8') or '{}')
    except Exception as exc:  # network failure or bad JSON
        msg = f'Could not reach Google: {exc.__class__.__name__}'
        conn.last_sync_error = msg
        conn.save(update_fields=['last_sync_error', 'updated_at'])
        return False, msg

    if resp.status != 200:
        err = (data.get('error') or {}).get('message') or f'Google returned HTTP {resp.status}'
        conn.last_sync_error = str(err)[:500]
        conn.save(update_fields=['last_sync_error', 'updated_at'])
        return False, conn.last_sync_error

    conn.rating = data.get('rating')
    conn.review_count = data.get('userRatingCount') or 0
    conn.reviews = [_clean_review(r) for r in (data.get('reviews') or [])][:5]
    if data.get('googleMapsUri') and not conn.maps_url:
        conn.maps_url = data['googleMapsUri']
    conn.last_synced_at = timezone.now()
    conn.last_sync_error = ''
    conn.save()
    return True, f'Synced: {conn.review_count} reviews, rating {conn.rating or "none yet"}.'


def refresh_if_stale(conn: GoogleReviewConnection) -> None:
    """Called from the public endpoint; refreshes at most once a day and never raises."""
    if not (conn.place_id and api_key_for(conn)):
        return
    now = timezone.now()
    if conn.last_synced_at and now - conn.last_synced_at < REFRESH_AFTER:
        return
    # After a failed attempt, wait an hour before trying again so visitors never trigger a retry storm.
    if conn.last_sync_error and now - conn.updated_at < timedelta(hours=1):
        return
    try:
        sync_reviews(conn)
    except Exception:
        pass
