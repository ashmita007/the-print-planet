import json
import logging
import os
import ssl
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_API_BASE = 'https://api.brevo.com/v3'


def _ssl_context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def _mask(secret):
    if not secret:
        return ''
    if len(secret) <= 10:
        return '****'
    return f"{secret[:6]}...{secret[-4:]}"


def get_brevo_api_key():
    key = (
        os.environ.get('BREVO_API_KEY', '')
        or getattr(settings, 'BREVO_API_KEY', '')
        or ''
    ).strip().strip('"\'')
    if key.startswith('BREVO_API_KEY='):
        key = key.split('BREVO_API_KEY=', 1)[1].strip().strip('"\'')
    return key


def get_brevo_sender_email():
    return (
        os.environ.get('BREVO_SENDER_EMAIL', '')
        or getattr(settings, 'BREVO_SENDER_EMAIL', '')
        or 'theprintplanet01@gmail.com'
    ).strip().strip('"\'')


def get_owner_recipient():
    return (
        os.environ.get('OWNER_NOTIFICATION_EMAIL', '')
        or getattr(settings, 'OWNER_NOTIFICATION_EMAIL', '')
        or 'theprintplanet01@gmail.com'
    ).strip()


def _brevo_call(method, path, payload=None, timeout=12):
    key = get_brevo_api_key()
    if not key:
        return None, {'ok': False, 'error': 'BREVO_API_KEY is not configured on this server.'}

    request = urllib.request.Request(
        f'{BREVO_API_BASE}{path}',
        data=json.dumps(payload).encode('utf-8') if payload is not None else None,
        headers={
            'api-key': key,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'ThePrintPlanet/1.0',
        },
        method=method,
    )

    try:
        with urllib.request.urlopen(request, context=_ssl_context(), timeout=timeout) as response:
            raw = response.read().decode('utf-8', errors='ignore')
            try:
                data = json.loads(raw) if raw else {}
            except Exception:
                data = {'raw': raw}
            return response.status, {'ok': True, 'data': data}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode('utf-8', errors='ignore')
        try:
            data = json.loads(raw)
        except Exception:
            data = {'message': raw}
        return exc.code, {
            'ok': False,
            'status': exc.code,
            'error': data.get('message') or raw or 'Brevo rejected the request.',
            'code': data.get('code', ''),
        }
    except Exception as exc:
        return None, {'ok': False, 'error': str(exc)}


def diagnose_email_delivery():
    """Validates the Brevo key, sender identity and SMTP fallback without sending email."""
    sender_email = get_brevo_sender_email()
    owner_recipient = get_owner_recipient()
    brevo_key = get_brevo_api_key()

    report = {
        'config': {
            'provider': 'brevo' if brevo_key else ('smtp' if getattr(settings, 'EMAIL_HOST_USER', '') else 'none'),
            'brevo_key_configured': bool(brevo_key),
            'brevo_key_preview': _mask(brevo_key),
            'brevo_sender_email': sender_email,
            'owner_recipient': owner_recipient,
            'smtp_user_configured': bool(getattr(settings, 'EMAIL_HOST_USER', '')),
            'smtp_password_configured': bool(getattr(settings, 'EMAIL_HOST_PASSWORD', '')),
            'smtp_backend': getattr(settings, 'EMAIL_BACKEND', ''),
        },
        'account': None,
        'senders': [],
        'sender_verified': False,
        'problems': [],
    }

    if not brevo_key:
        report['problems'].append(
            'BREVO_API_KEY is missing. On Render free tier SMTP ports are blocked, so Gmail SMTP cannot deliver mail.'
        )
        return report

    status, account = _brevo_call('GET', '/account')
    if not account.get('ok'):
        report['problems'].append(
            f"Brevo API key was rejected (HTTP {status or 'network'}): {account.get('error')}"
        )
    else:
        data = account.get('data', {})
        report['account'] = {
            'email': data.get('email'),
            'company_name': data.get('companyName'),
            'plan': (data.get('plan') or [{}])[0].get('type') if isinstance(data.get('plan'), list) else data.get('plan'),
        }

    status, senders_response = _brevo_call('GET', '/senders')
    if not senders_response.get('ok'):
        report['problems'].append(
            f"Could not read Brevo senders (HTTP {status or 'network'}): {senders_response.get('error')}"
        )
    else:
        senders = senders_response.get('data', {}).get('senders', []) or []
        report['senders'] = [
            {
                'email': sender.get('email'),
                'name': sender.get('name'),
                'active': bool(sender.get('active')),
            }
            for sender in senders
        ]
        report['sender_verified'] = any(
            (sender.get('email') or '').lower() == sender_email.lower() and sender.get('active')
            for sender in senders
        )
        if not report['sender_verified']:
            report['problems'].append(
                f"Sender '{sender_email}' is not an active verified sender in Brevo. "
                'Verify it under Brevo > Senders & IP, then set BREVO_SENDER_EMAIL to that exact address.'
            )

    return report


def send_diagnostic_email(to_email):
    """Sends a real test email and returns the raw provider outcome for troubleshooting."""
    sender_email = get_brevo_sender_email()
    brevo_key = get_brevo_api_key()

    subject = 'Email Delivery Test - The Print Planet'
    text = (
        'This is a test email from The Print Planet website.\n\n'
        'If you received this message, transactional email delivery is working.\n'
    )
    html = (
        '<div style="font-family:Arial,sans-serif;padding:24px;color:#263445;">'
        '<h2 style="color:#17365D;margin:0 0 8px;">Email delivery is working</h2>'
        '<p style="margin:0;">This test message was sent from the The Print Planet website backend.</p>'
        '</div>'
    )

    if not brevo_key:
        return {
            'ok': False,
            'provider': 'none',
            'error': 'BREVO_API_KEY is not configured. Render free tier blocks SMTP, so no email can be sent.',
        }

    payload = {
        'sender': {'name': 'The Print Planet', 'email': sender_email},
        'to': [{'email': to_email}],
        'replyTo': {'name': 'The Print Planet', 'email': get_owner_recipient()},
        'subject': subject,
        'htmlContent': html,
        'textContent': text,
    }

    status, result = _brevo_call('POST', '/smtp/email', payload)
    if result.get('ok'):
        return {
            'ok': True,
            'provider': 'brevo',
            'status': status,
            'sender': sender_email,
            'recipient': to_email,
            'message_id': (result.get('data') or {}).get('messageId', ''),
            'message': 'Brevo accepted the test email. Check the inbox and spam folder.',
        }

    return {
        'ok': False,
        'provider': 'brevo',
        'status': status,
        'sender': sender_email,
        'recipient': to_email,
        'error': result.get('error'),
        'code': result.get('code'),
    }
