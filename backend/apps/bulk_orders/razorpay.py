"""Minimal Razorpay client: order creation, payment lookup/capture and signature checks.

Uses the standard library only. Keys come from the owner's admin settings
(PaymentGatewaySettings) when enabled, otherwise from the RAZORPAY_* environment variables.
"""
import base64
import hashlib
import hmac
import json
import urllib.error
import urllib.request

from django.conf import settings

API_BASE = 'https://api.razorpay.com/v1'
TIMEOUT = 15


class RazorpayError(Exception):
    pass


def credentials() -> tuple[str, str, str, str]:
    """(key_id, key_secret, webhook_secret, source) where source is 'admin', 'environment' or 'none'."""
    from .models import PaymentGatewaySettings
    from .secret_box import decrypt

    saved = PaymentGatewaySettings.load()
    if saved.enabled and saved.key_id and saved.key_secret_encrypted:
        secret = decrypt(saved.key_secret_encrypted)
        if secret:
            webhook_secret = decrypt(saved.webhook_secret_encrypted) or settings.RAZORPAY_WEBHOOK_SECRET
            return saved.key_id, secret, webhook_secret, 'admin'
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        return settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET, settings.RAZORPAY_WEBHOOK_SECRET, 'environment'
    return '', '', '', 'none'


def key_id() -> str:
    return credentials()[0]


def is_configured() -> bool:
    return credentials()[3] != 'none'


def _call(method: str, path: str, key: str, secret: str, payload: dict | None = None) -> dict:
    token = base64.b64encode(f'{key}:{secret}'.encode()).decode()
    req = urllib.request.Request(
        f'{API_BASE}{path}',
        data=json.dumps(payload).encode() if payload is not None else None,
        method=method,
        headers={'Authorization': f'Basic {token}', 'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return json.loads(resp.read() or b'{}')
    except urllib.error.HTTPError as exc:
        raise RazorpayError(f'Razorpay {method} {path.split("/")[1].split("?")[0]} failed ({exc.code})') from exc
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        raise RazorpayError('Could not reach Razorpay.') from exc


def _request(method: str, path: str, payload: dict | None = None) -> dict:
    key, secret, _, source = credentials()
    if source == 'none':
        raise RazorpayError('Online payment is not configured yet.')
    return _call(method, path, key, secret, payload)


def check_keys(key: str, secret: str) -> None:
    """Raise RazorpayError unless Razorpay accepts these keys (read-only call)."""
    _call('GET', '/orders?count=1', key, secret)


def create_order(amount_paise: int, receipt: str, notes: dict) -> dict:
    return _request('POST', '/orders', {
        'amount': amount_paise, 'currency': 'INR', 'receipt': receipt[:40], 'notes': notes,
    })


def fetch_payment(payment_id: str) -> dict:
    return _request('GET', f'/payments/{payment_id}')


def capture_payment(payment_id: str, amount_paise: int) -> dict:
    """Capture an 'authorized' payment; accounts on manual capture would otherwise auto-refund it."""
    return _request('POST', f'/payments/{payment_id}/capture', {'amount': amount_paise, 'currency': 'INR'})


def _hmac(secret: str, message: bytes) -> str:
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    secret = credentials()[1]
    if not (secret and order_id and payment_id and signature):
        return False
    return hmac.compare_digest(_hmac(secret, f'{order_id}|{payment_id}'.encode()), signature)


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    secret = credentials()[2]
    if not (secret and signature):
        return False
    return hmac.compare_digest(_hmac(secret, body), signature)
