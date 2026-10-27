import json
import logging
import os
import ssl
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_API_BASE = 'https://api.brevo.com/v3'
RESEND_API_BASE = 'https://api.resend.com'


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

def get_resend_api_key():
    key = (
        os.environ.get('RESEND_API_KEY', '')
        or getattr(settings, 'RESEND_API_KEY', '')
        or ''
    ).strip().strip('"\'')
    if key.startswith('RESEND_API_KEY='):
        key = key.split('RESEND_API_KEY=', 1)[1].strip().strip('"\'')
    return key


def get_resend_from_email():
    return (
        os.environ.get('RESEND_FROM_EMAIL', '')
        or getattr(settings, 'RESEND_FROM_EMAIL', '')
        or 'The Print Planet <onboarding@resend.dev>'
    ).strip().strip('"\'')


def _email_address(value):
    value = (value or '').strip()
    if '<' in value and '>' in value:
        return value.split('<', 1)[1].split('>', 1)[0].strip()
    return value


def _resend_call(method, path, payload=None, timeout=12):
    key = get_resend_api_key()
    if not key:
        return None, {'ok': False, 'error': 'RESEND_API_KEY is not configured on this server.'}

    request = urllib.request.Request(
        f'{RESEND_API_BASE}{path}',
        data=json.dumps(payload).encode('utf-8') if payload is not None else None,
        headers={
            'Authorization': f'Bearer {key}',
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
            'error': data.get('message') or raw or 'Resend rejected the request.',
            'code': data.get('name', ''),
        }
    except Exception as exc:
        return None, {'ok': False, 'error': str(exc)}



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
    """Validates configured HTTPS email providers without sending a message."""
    sender_email = get_brevo_sender_email()
    resend_from = get_resend_from_email()
    owner_recipient = get_owner_recipient()
    brevo_key = get_brevo_api_key()
    resend_key = get_resend_api_key()
    provider_pref = (
        os.environ.get('EMAIL_PROVIDER', '')
        or getattr(settings, 'EMAIL_PROVIDER', '')
    ).strip().lower()

    report = {
        'config': {
            'provider': 'none',
            'preferred_provider': provider_pref or 'auto',
            'brevo_key_configured': bool(brevo_key),
            'brevo_key_preview': _mask(brevo_key),
            'brevo_sender_email': sender_email,
            'resend_key_configured': bool(resend_key),
            'resend_key_preview': _mask(resend_key),
            'resend_from_email': resend_from,
            'active_sender_email': '',
            'owner_recipient': owner_recipient,
            'smtp_user_configured': bool(getattr(settings, 'EMAIL_HOST_USER', '')),
            'smtp_password_configured': bool(getattr(settings, 'EMAIL_HOST_PASSWORD', '')),
            'smtp_backend': getattr(settings, 'EMAIL_BACKEND', ''),
        },
        'account': None,
        'senders': [],
        'sender_verified': False,
        'brevo_sender_verified': False,
        'resend': None,
        'resend_sender_verified': False,
        'problems': [],
    }

    # ---- Brevo ----
    if brevo_key:
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
            report['brevo_sender_verified'] = any(
                (_email_address(sender.get('email'))).lower() == sender_email.lower() and sender.get('active')
                for sender in senders
            )
            if not report['brevo_sender_verified']:
                report['problems'].append(
                    f"Brevo sender '{sender_email}' is not active/verified. "
                    'Verify it under Brevo > Senders & IP, then set BREVO_SENDER_EMAIL to that exact address.'
                )

    # ---- Resend ----
    if resend_key:
        resend_report = {
            'key_valid': False,
            'domains': [],
            'sender_domain': '',
            'sandbox': False,
            'sender_verified': False,
            'note': '',
        }
        status, domains_response = _resend_call('GET', '/domains')
        if not domains_response.get('ok'):
            report['problems'].append(
                f"Resend API key was rejected (HTTP {status or 'network'}): {domains_response.get('error')}"
            )
        else:
            resend_report['key_valid'] = True
            domains = domains_response.get('data', {}).get('data', []) or []
            resend_report['domains'] = [
                {'name': domain.get('name'), 'status': domain.get('status')}
                for domain in domains
            ]

            resend_sender = _email_address(resend_from)
            resend_report['sender_domain'] = (
                resend_sender.split('@', 1)[1].lower() if '@' in resend_sender else ''
            )
            if resend_report['sender_domain'] == 'resend.dev':
                resend_report['sandbox'] = True
                resend_report['sender_verified'] = True
                resend_report['note'] = (
                    'Sandbox sender: Resend only delivers to the email address that owns the Resend account. '
                    'Verify theprintplanet.co.in to email customers.'
                )
            else:
                resend_report['sender_verified'] = any(
                    (domain.get('name') or '').lower() == resend_report['sender_domain']
                    and (domain.get('status') or '').lower() == 'verified'
                    for domain in domains
                )
                if not resend_report['sender_verified']:
                    report['problems'].append(
                        f"Resend sending domain '{resend_report['sender_domain']}' is not verified. "
                        'Add the DNS records under Resend > Domains, or leave RESEND_FROM_EMAIL unset to use the sandbox sender.'
                    )

        report['resend'] = resend_report
        report['resend_sender_verified'] = bool(resend_report['sender_verified'])

    # ---- Pick the active provider ----
    if provider_pref in ('brevo', 'resend'):
        provider = provider_pref
    elif report['brevo_sender_verified']:
        provider = 'brevo'
    elif report['resend_sender_verified']:
        provider = 'resend'
    elif brevo_key:
        provider = 'brevo'
    elif resend_key:
        provider = 'resend'
    elif getattr(settings, 'EMAIL_HOST_USER', ''):
        provider = 'smtp'
    else:
        provider = 'none'

    if provider == 'brevo':
        report['sender_verified'] = report['brevo_sender_verified']
        report['config']['active_sender_email'] = sender_email
    elif provider == 'resend':
        report['sender_verified'] = report['resend_sender_verified']
        report['config']['active_sender_email'] = _email_address(resend_from)
    elif provider == 'smtp':
        report['config']['active_sender_email'] = getattr(settings, 'EMAIL_HOST_USER', '')
    report['config']['provider'] = provider

    if not brevo_key and not resend_key:
        report['problems'].append(
            'No HTTPS email provider is configured. Render free tier blocks SMTP ports 25/465/587, '
            'so add RESEND_API_KEY (recommended) or BREVO_API_KEY.'
        )

    return report


def send_diagnostic_email(to_email):
    """Sends a real test email through each configured provider and reports the raw outcome."""
    brevo_key = get_brevo_api_key()
    resend_key = get_resend_api_key()
    sender_email = get_brevo_sender_email()
    resend_from = get_resend_from_email()
    owner_email = get_owner_recipient()
    provider_pref = (
        os.environ.get('EMAIL_PROVIDER', '')
        or getattr(settings, 'EMAIL_PROVIDER', '')
    ).strip().lower()

    subject = 'Email Delivery Test - The Print Planet'
    text = (
        'This is a test email from The Print Planet website.\n\n'
        'If you received this message, transactional email delivery is working.\n'
    )
    html = (
        '<div style="font-family:Arial,sans-serif;padding:24px;color:#263445;">'
        '<h2 style="color:#17365D;margin:0 0 8px;">Email delivery is working</h2>'
        '<p style="margin:0;">This test message was sent from The Print Planet website backend.</p>'
        '</div>'
    )

    attempts = []

    # ---- Brevo ----
    if brevo_key and provider_pref != 'resend':
        payload = {
            'sender': {'name': 'The Print Planet', 'email': sender_email},
            'to': [{'email': to_email}],
            'replyTo': {'name': 'The Print Planet', 'email': owner_email},
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
        attempts.append({
            'provider': 'brevo',
            'status': status,
            'sender': sender_email,
            'error': result.get('error'),
            'code': result.get('code'),
        })

    # ---- Resend ----
    if resend_key and provider_pref != 'brevo':
        def _resend_send(sender):
            status, result = _resend_call('POST', '/emails', {
                'from': sender,
                'to': [to_email],
                'reply_to': owner_email,
                'subject': subject,
                'html': html,
                'text': text,
            })
            return status, result

        status, result = _resend_send(resend_from)
        if result.get('ok'):
            return {
                'ok': True,
                'provider': 'resend',
                'status': status,
                'sender': _email_address(resend_from),
                'recipient': to_email,
                'message_id': (result.get('data') or {}).get('id', ''),
                'message': 'Resend accepted the test email. Check the inbox and spam folder.',
            }
        attempts.append({
            'provider': 'resend',
            'status': status,
            'sender': _email_address(resend_from),
            'error': result.get('error'),
            'code': result.get('code'),
        })

        # If a custom sender domain is not verified yet, retry the owner address via sandbox.
        if (
            'onboarding@resend.dev' not in resend_from
            and owner_email
            and to_email.lower() == owner_email.lower()
        ):
            status, retry = _resend_send('The Print Planet <onboarding@resend.dev>')
            if retry.get('ok'):
                return {
                    'ok': True,
                    'provider': 'resend-sandbox',
                    'status': status,
                    'sender': 'onboarding@resend.dev',
                    'recipient': to_email,
                    'message_id': (retry.get('data') or {}).get('id', ''),
                    'message': 'Resend sandbox accepted the test email. Verify your domain to email customers.',
                }
            attempts.append({
                'provider': 'resend-sandbox',
                'status': status,
                'sender': 'onboarding@resend.dev',
                'error': retry.get('error'),
                'code': retry.get('code'),
            })

    if not attempts:
        return {
            'ok': False,
            'provider': 'none',
            'error': 'No HTTPS email provider is configured. Add RESEND_API_KEY (recommended) or BREVO_API_KEY.',
        }

    summary = ' | '.join(
        f"{item['provider']}: {item.get('error') or 'rejected'}" for item in attempts
    )
    last = attempts[-1]
    return {
        'ok': False,
        'provider': last.get('provider'),
        'status': last.get('status'),
        'sender': last.get('sender'),
        'recipient': to_email,
        'error': summary,
        'code': last.get('code'),
        'attempts': attempts,
    }
