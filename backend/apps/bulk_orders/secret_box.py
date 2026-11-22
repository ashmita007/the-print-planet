"""
Encrypt small secrets (payment gateway keys) before they are stored in the database.

The database is copied to offsite backups, so secrets are encrypted with a key derived from
DJANGO_SECRET_KEY, which lives only in the server environment. If DJANGO_SECRET_KEY changes,
stored secrets can no longer be read and must be entered again.
"""
import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


# Keys committed to this repository (settings default and docker-compose files). They are public.
PUBLIC_SECRET_KEYS = {
    'the-print-planet-production-secret-key-2026',
    'production-secret-single-unit-key-2026',
}


def available():
    """False while the server runs on a SECRET_KEY that is public, which cannot protect secrets."""
    key = settings.SECRET_KEY or ''
    return bool(key) and not key.startswith('django-insecure') and key not in PUBLIC_SECRET_KEYS


def _fernet():
    digest = hashlib.sha256(f'payment-secrets:{settings.SECRET_KEY}'.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt(value):
    return _fernet().encrypt(value.encode()).decode() if value else ''


def decrypt(token):
    """Return the secret, or '' when there is none or it cannot be read."""
    if not token:
        return ''
    try:
        return _fernet().decrypt(token.encode()).decode()
    except InvalidToken:
        return ''
