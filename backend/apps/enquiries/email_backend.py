import ssl
from django.core.mail.backends.smtp import EmailBackend


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
        except Exception:
            return ssl.create_default_context()
