"""Customer emails for order timeline events. Sent after the transaction commits; failures are logged."""
import html
import logging
import threading

from django.db import transaction

logger = logging.getLogger(__name__)


def _deliver(to_email, subject, text, body_html):
    """Hand the message to the shared Resend/Brevo sender on a thread so requests never wait on the network."""
    from apps.enquiries.services import _send_email_via_https

    def run():
        try:
            if not _send_email_via_https(to_email, subject, text, body_html):
                logger.warning('Order email to %s was not delivered by any provider.', to_email)
        except Exception:  # an email problem must never break order handling
            logger.exception('Order email to %s failed', to_email)

    threading.Thread(target=run, daemon=True).start()


def _send_event_email(event_id):
    from .models import OrderEvent
    try:
        event = OrderEvent.objects.select_related('order').get(pk=event_id)
        order = event.order
        if not order.email:
            return
        label = dict(order.STATUS_CHOICES).get(event.status, event.status)
        lines = [f'Hello {order.contact_person or "there"},', '', f'Order {order.order_number}: {label}.']
        if event.note:
            lines.append(event.note)
        if event.courier or event.awb:
            lines.append(f'Courier: {event.courier or "-"}  Tracking number: {event.awb or "-"}')
        lines += ['', 'The Print Planet']
        text = '\n'.join(lines)
        body_html = '<br>'.join(html.escape(line) for line in lines)
        _deliver(order.email, f'Order {order.order_number}: {label}', text, body_html)
    except Exception:
        logger.exception('Could not prepare the email for order event %s', event_id)


def notify_after_commit(event):
    transaction.on_commit(lambda: _send_event_email(event.pk))
