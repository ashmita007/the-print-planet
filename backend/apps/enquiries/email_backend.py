import logging
import ssl
from django.core.mail.backends.smtp import EmailBackend

logger = logging.getLogger(__name__)


class CertifiEmailBackend(EmailBackend):
    """
    Robust SMTP Email Backend using certifi CA certificates for TLS handshake.
    Eliminates [SSL: CERTIFICATE_VERIFY_FAILED] issues across macOS, Render, and Docker.
    """
    @property
    def ssl_context(self):
        try:
            import certifi
            return ssl.create_default_context(cafile=certifi.where())
        except Exception:  # certifi missing or unreadable: fall back to system CAs
            logger.exception('certifi CA bundle unavailable, using system CAs')
            return ssl.create_default_context()
