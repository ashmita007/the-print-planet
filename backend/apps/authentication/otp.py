"""Email OTP for new accounts and the password-reset email.

A new account is created inactive and stays that way until the buyer types the 6-digit
code we email them. Codes are stored as an HMAC (keyed with SECRET_KEY), expire after
OTP_TTL_MINUTES, allow OTP_MAX_ATTEMPTS wrong tries, and only the newest code works.
"""
import hashlib
import hmac
import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import EmailOTP

logger = logging.getLogger(__name__)

OTP_TTL_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_MAX_PER_HOUR = 5


def _new_code() -> str:
    return f'{secrets.randbelow(1_000_000):06d}'


def _hash(user_id: int, code: str) -> str:
    msg = f'{user_id}:{code}'.encode()
    return hmac.new(settings.SECRET_KEY.encode(), msg, hashlib.sha256).hexdigest()


def is_pending_verification(user) -> bool:
    """Inactive because the email was never confirmed (not an account the owner disabled)."""
    codes = user.email_otps.filter(purpose=EmailOTP.PURPOSE_REGISTER)
    return not user.is_active and codes.exists() and not codes.filter(used_at__isnull=False).exists()


def mark_verified(user):
    """Record that the inbox was proven (code entered, or a reset link opened)."""
    latest = user.email_otps.filter(purpose=EmailOTP.PURPOSE_REGISTER).first()
    if latest and not latest.used_at:
        latest.used_at = timezone.now()
        latest.save(update_fields=['used_at'])


def seconds_until_resend(user) -> int:
    latest = user.email_otps.filter(purpose=EmailOTP.PURPOSE_REGISTER).first()
    if not latest:
        return 0
    wait = OTP_RESEND_COOLDOWN_SECONDS - (timezone.now() - latest.created_at).total_seconds()
    return max(0, int(wait + 0.999))


def sent_last_hour(user) -> int:
    since = timezone.now() - timedelta(hours=1)
    return user.email_otps.filter(purpose=EmailOTP.PURPOSE_REGISTER, created_at__gte=since).count()


def issue_code(user, company: str = '') -> str:
    """Create a fresh code (older ones stop working) and return it in plain text for the email."""
    code = _new_code()
    EmailOTP.objects.create(
        user=user,
        purpose=EmailOTP.PURPOSE_REGISTER,
        code_hash=_hash(user.id, code),
        expires_at=timezone.now() + timedelta(minutes=OTP_TTL_MINUTES),
        signup_company=(company or '')[:200],
    )
    return code


class OTPResult:
    OK = 'ok'
    WRONG = 'wrong'
    EXPIRED = 'expired'
    LOCKED = 'locked'
    MISSING = 'missing'


def signup_company(user) -> str:
    return user.email_otps.exclude(signup_company='').values_list('signup_company', flat=True).first() or ''


def check_code(user, code: str):
    """Returns (result, attempts_left)."""
    otp = user.email_otps.filter(purpose=EmailOTP.PURPOSE_REGISTER, used_at__isnull=True).first()
    latest = user.email_otps.filter(purpose=EmailOTP.PURPOSE_REGISTER).first()
    if not otp or otp.pk != latest.pk:
        return OTPResult.MISSING, 0
    if otp.attempts >= OTP_MAX_ATTEMPTS:
        return OTPResult.LOCKED, 0
    if timezone.now() >= otp.expires_at:
        return OTPResult.EXPIRED, 0

    code = ''.join(ch for ch in str(code) if ch.isdigit())
    if len(code) == 6 and hmac.compare_digest(otp.code_hash, _hash(user.id, code)):
        otp.used_at = timezone.now()
        otp.save(update_fields=['used_at'])
        return OTPResult.OK, OTP_MAX_ATTEMPTS - otp.attempts

    otp.attempts += 1
    otp.save(update_fields=['attempts'])
    left = OTP_MAX_ATTEMPTS - otp.attempts
    return (OTPResult.LOCKED if left <= 0 else OTPResult.WRONG), max(0, left)


def _send(to_email, subject, text, html) -> bool:
    from apps.enquiries.services import _send_email_via_https
    try:
        return bool(_send_email_via_https(to_email, subject, text, html))
    except Exception:
        logger.exception('Auth email to %s failed', to_email)
        return False


def send_code_email(user, code: str) -> bool:
    from apps.enquiries.email_templates import verify_email_otp_email
    name = user.first_name or 'there'
    subject = f'{code} is your The Print Planet verification code'
    text = (
        f'Hi {name},\n\n'
        f'Your verification code is {code}\n\n'
        f'Enter it on the sign-up page to finish creating your account. '
        f'It expires in {OTP_TTL_MINUTES} minutes.\n\n'
        "If you didn't try to create an account, you can ignore this email.\n\n"
        'The Print Planet, Bengaluru\nhttps://theprintplanet.co.in'
    )
    html = verify_email_otp_email({'name': name, 'code': code, 'minutes': OTP_TTL_MINUTES})
    return _send(user.email, subject, text, html)


def reset_link_minutes() -> int:
    return max(1, int(getattr(settings, 'PASSWORD_RESET_TIMEOUT', 3600)) // 60)


def send_reset_email(user, reset_url: str) -> bool:
    from apps.enquiries.email_templates import password_reset_email
    name = user.first_name or user.username
    minutes = reset_link_minutes()
    subject = 'Reset your The Print Planet password'
    text = (
        f'Hi {name},\n\n'
        'We received a request to reset the password for your The Print Planet account.\n\n'
        f'Set a new password here (the link works once and expires in {minutes} minutes):\n{reset_url}\n\n'
        "If you didn't ask for this, ignore this email. Your password stays the same.\n\n"
        'The Print Planet, Bengaluru\nhttps://theprintplanet.co.in'
    )
    html = password_reset_email({'name': name, 'reset_url': reset_url, 'minutes': minutes})
    return _send(user.email, subject, text, html)
