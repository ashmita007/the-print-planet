"""Order fulfilment: status changes, timeline, quote builder, cancel/return requests, refunds, invoices.

Every change records an OrderEvent explicitly here (no signals) and queues the customer email.
"""
import logging
from datetime import timedelta
from zoneinfo import ZoneInfo
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.db.models import Max, Sum
from django.utils import timezone

from apps.settings_app.models import SiteSettings
from . import razorpay
from .commerce import (
    QuoteError, can_transition, cancellable, compute_quote, financial_year, money, normalize_state, state_of_gstin,
)
from .models import BulkOrder, Invoice, OrderEvent, OrderRequest
from .notifications import notify_after_commit

logger = logging.getLogger(__name__)

IST = ZoneInfo('Asia/Kolkata')


class InvalidTransition(Exception):
    pass


class RequestError(Exception):
    """A cancel/return request or decision is not allowed; the message is safe to show."""


class InvoiceBlocked(Exception):
    pass


def record_event(order, actor, note='', courier='', awb='', status=None, internal=False):
    event = OrderEvent.objects.create(
        order=order, status=status or order.status, note=note, courier=courier, awb=awb, actor=actor, internal=internal,
    )
    if not internal:
        notify_after_commit(event)
    return event


def change_status(order, new_status, actor, note='', courier='', awb=''):
    """Move `order` along the allowed transitions and log it. Same status is a no-op unless tracking changes."""
    if new_status != order.status:
        if not can_transition(order.status, new_status):
            raise InvalidTransition(f'Cannot move an order from {order.status} to {new_status}.')
        order.status = new_status
    elif not (courier or awb):
        return None
    fields = ['status', 'updated_at']
    if courier:
        order.tracking_courier_partner = courier
        fields.append('tracking_courier_partner')
    if awb:
        order.tracking_consignment_number = awb
        fields.append('tracking_consignment_number')
    order.save(update_fields=fields)
    return record_event(order, actor, note=note, courier=courier, awb=awb)


# ---------------------------------------------------------------------------
# Quote
# ---------------------------------------------------------------------------
def buyer_state_for(order):
    """The buyer's GSTIN state wins when present; otherwise the shipping address state."""
    gstin = (order.billing_address or {}).get('gstin') or order.gst_number
    return state_of_gstin(gstin) or (order.shipping_address or {}).get('state') or order.state


def preview_quote(order, subtotal, gst_rate=None):
    cfg = SiteSettings.get_settings()
    if gst_rate is None:
        product_rate = order.product.gst_rate if order.product_id else None
        gst_rate = product_rate if product_rate is not None else cfg.default_gst_rate
    return compute_quote(
        subtotal, gst_rate=gst_rate, shipping_flat_fee=cfg.shipping_flat_fee,
        free_shipping_above=cfg.free_shipping_above, seller_state=state_of_gstin(cfg.seller_gstin) or cfg.seller_state,
        buyer_state=buyer_state_for(order),
    )


def apply_quote(order, subtotal, actor, gst_rate=None, line_notes=None, note=''):
    """Compute the quote on the server, store the breakdown and move the order to 'quoted'.

    A paid order's total never changes. A legacy paid order (no breakdown yet) may still get its
    breakdown, but only when the computed total equals the amount already paid, to the paisa.
    """
    paid = order.is_paid
    if paid:
        if order.quoted_amount is None:
            raise InvalidTransition('This order has no paid amount to match.')
        if order.quote_subtotal is not None:
            raise InvalidTransition('This quote has already been paid online and cannot be changed.')
    elif order.status not in ('submitted', 'reviewing', 'quoted'):
        raise InvalidTransition(f'An order that is {order.status} cannot be quoted.')
    quote = preview_quote(order, subtotal, gst_rate)
    if paid and quote['total'] != money(order.quoted_amount):
        gap = quote['total'] - money(order.quoted_amount)
        raise InvalidTransition(
            f"The paid amount is ₹{money(order.quoted_amount):,.2f} but these numbers total "
            f"₹{quote['total']:,.2f} (difference ₹{gap:,.2f}). Adjust the subtotal or GST rate to match."
        )
    with transaction.atomic():
        order.quote_subtotal = quote['subtotal']
        order.quote_shipping = quote['shipping']
        order.quote_gst_rate = quote['gst_rate']
        order.quote_tax = quote['tax']
        order.quote_cgst = quote['cgst']
        order.quote_sgst = quote['sgst']
        order.quote_igst = quote['igst']
        fields = [
            'quote_subtotal', 'quote_shipping', 'quote_gst_rate', 'quote_tax', 'quote_cgst', 'quote_sgst',
            'quote_igst', 'quote_line_notes', 'quote_notes', 'updated_at',
        ]
        if not paid:
            order.quoted_amount = quote['total']
            fields.append('quoted_amount')
        if line_notes is not None:
            order.quote_line_notes = line_notes
        if note:
            order.quote_notes = note
        order.save(update_fields=fields)
        text = f"Quote ready: total ₹{quote['total']:,.2f} (goods ₹{quote['subtotal']:,.2f}, shipping ₹{quote['shipping']:,.2f}, GST ₹{quote['tax']:,.2f})."
        if paid:
            record_event(order, actor, note=f'Tax breakdown added to the paid quote: GST ₹{quote["tax"]:,.2f}.', internal=True)
        elif order.status != 'quoted':
            change_status(order, 'quoted', actor, note=text)
        else:
            record_event(order, actor, note=text)
    return quote


# ---------------------------------------------------------------------------
# Payment and invoice
# ---------------------------------------------------------------------------
def issue_invoice(order):
    """Create the order's invoice once, numbered per financial year. Returns the existing one if present."""
    with transaction.atomic():
        # Lock the settings row so two payments cannot read the same last number; the unique
        # constraint is the final guard if a database ignores the lock.
        cfg = SiteSettings.objects.select_for_update().order_by('pk').first() or SiteSettings.get_settings()
        existing = Invoice.objects.filter(order=order).first()  # re-checked inside the lock
        if existing:
            return existing
        if not cfg.invoice_prefix:
            raise InvoiceBlocked('Set the invoice prefix in Commerce settings to issue invoices.')
        if not cfg.seller_gstin:
            raise InvoiceBlocked('Set the seller GSTIN in Commerce settings to issue invoices.')
        if order.quote_subtotal is None or order.quote_tax is None:
            raise InvoiceBlocked('This quote has no tax breakdown. Build the quote with the quote builder first.')
        # Financial years follow Indian time: 31 March 20:00 UTC is already 1 April in India.
        fy = financial_year((order.paid_at or timezone.now()).astimezone(IST).date())
        snapshot = invoice_snapshot(order, cfg)
        for _ in range(5):
            sequence = (Invoice.objects.filter(financial_year=fy).aggregate(m=Max('sequence'))['m'] or 0) + 1
            number = f'{cfg.invoice_prefix}/{fy}/{sequence:04d}'
            try:
                with transaction.atomic():
                    return Invoice.objects.create(
                        order=order, financial_year=fy, sequence=sequence, number=number,
                        snapshot={**snapshot, 'number': number},
                    )
            except IntegrityError:
                continue
    raise InvoiceBlocked('Could not allocate an invoice number. Please try again.')


def invoice_snapshot(order, cfg):
    product = order.product
    description = (product.name if product else order.product_name_text) or order.category_type
    return {
        'seller': {
            'name': cfg.business_name, 'gstin': cfg.seller_gstin, 'address': cfg.address, 'state': cfg.seller_state,
        },
        'buyer': {
            'name': order.organization_name, 'contact': order.contact_person, 'email': order.email,
            'phone': order.phone, 'gstin': (order.billing_address or {}).get('gstin') or order.gst_number,
        },
        'billing_address': order.billing_address or {},
        'shipping_address': order.shipping_address or {},
        'order_number': order.order_number,
        'lines': [{
            'description': description, 'quantity': order.estimated_quantity,
            'hsn_code': product.hsn_code if product else '', 'notes': order.quote_line_notes or [],
        }],
        'subtotal': str(order.quote_subtotal), 'shipping': str(order.quote_shipping),
        'gst_rate': str(order.quote_gst_rate), 'cgst': str(order.quote_cgst), 'sgst': str(order.quote_sgst),
        'igst': str(order.quote_igst), 'tax': str(order.quote_tax), 'total': str(order.quoted_amount),
        'payment': {'razorpay_payment_id': order.razorpay_payment_id, 'paid_at': order.paid_at.isoformat() if order.paid_at else ''},
    }


def mark_paid(order, payment_id, amount, paid_at):
    """Called inside the payment transaction once Razorpay confirmed the capture, for a quoted order only."""
    order.paid_amount = amount
    order.paid_at = paid_at
    order.razorpay_payment_id = payment_id
    order.save(update_fields=['paid_amount', 'paid_at', 'razorpay_payment_id', 'updated_at'])
    note = f'Payment of ₹{amount:,.2f} received online (Razorpay {payment_id}).'
    try:
        invoice = issue_invoice(order)
        note += f' Invoice {invoice.number} issued.'
    except InvoiceBlocked as exc:
        logger.warning('No invoice for %s: %s', order.order_number, exc)
        blocked = str(exc)
    else:
        blocked = ''
    change_status(order, 'paid', 'system', note=note)
    if blocked:
        # Owner-facing: the customer's email above stays free of internal setup problems.
        record_event(order, 'system', note=f'Invoice not issued: {blocked.rstrip(".")}. Add the tax breakdown, then issue it.',
                     internal=True)


# ---------------------------------------------------------------------------
# Cancel / return requests
# ---------------------------------------------------------------------------
def _completed_at(order):
    event = order.events.filter(status='completed').order_by('created_at').first()
    return event.created_at if event else order.updated_at


def create_request(order, kind, reason):
    cfg = SiteSettings.get_settings()
    if kind not in ('cancel', 'return'):
        raise RequestError('Request type must be cancel or return.')
    if kind == 'cancel':
        if not cancellable(order.status, cfg.cancellation_allowed_until):
            raise RequestError('This order can no longer be cancelled online. Please contact us.')
    else:
        if cfg.return_window_days is None:
            raise RequestError('Returns are not available. Please contact us.')
        if order.status != 'completed':
            raise RequestError('Only delivered orders can be returned.')
        if timezone.now() > _completed_at(order) + timedelta(days=cfg.return_window_days):
            raise RequestError(f'The {cfg.return_window_days}-day return window has passed.')
    with transaction.atomic():
        order = BulkOrder.objects.select_for_update().get(pk=order.pk)
        if order.requests.filter(kind=kind, status='pending').exists():
            raise RequestError('You already have a pending request for this order.')
        req = OrderRequest.objects.create(order=order, kind=kind, reason=reason.strip())
        record_event(order, 'customer', note=f'{kind.title()} requested. {req.reason}'.strip())
    return req


def decide_request(request_id, decision, owner_note='', refund_amount=None):
    """Owner approves or declines. Approval cancels/returns the order and refunds through Razorpay."""
    if decision not in ('approve', 'decline'):
        raise RequestError('Decision must be approve or decline.')
    with transaction.atomic():
        req = OrderRequest.objects.select_for_update().get(pk=request_id)
        if req.status != 'pending':
            raise RequestError('This request was already decided.')
        order = BulkOrder.objects.select_for_update().get(pk=req.order_id)
        req.owner_note = owner_note
        req.decided_at = timezone.now()
        if decision == 'decline':
            req.status = 'declined'
            req.save()
            record_event(order, 'owner', note=f'Your {req.kind} request was declined. {owner_note}'.strip())
            return req

        target = 'cancelled' if req.kind == 'cancel' else 'returned'
        if not can_transition(order.status, target):
            raise RequestError(f'An order that is {order.status} cannot be {target}.')
        amount = _refund_amount(order, req, refund_amount)
        if amount > 0:
            paise = int((amount * 100).to_integral_value())
            result = razorpay.refund(order.razorpay_payment_id, paise, idempotency_key=f'tpp-req-{req.pk}-{paise}')
            req.razorpay_refund_id = str(result.get('id') or '')
            req.refund_amount = amount
        req.status = 'approved'
        req.save()
        text = f'Your {req.kind} request was approved.'
        if amount > 0:
            text += f' Refund of ₹{amount:,.2f} started.'
        change_status(order, target, 'owner', note=f'{text} {owner_note}'.strip())
    return req


def _refund_amount(order, req, requested):
    """Refund to pay: the owner's amount, or everything still refundable. Never above what was paid."""
    paid = order.paid_amount or Decimal('0')
    already = (OrderRequest.objects.filter(order=order, status='approved').exclude(pk=req.pk)
               .aggregate(total=Sum('refund_amount'))['total'] or Decimal('0'))
    refundable = paid - already
    if requested in (None, ''):
        amount = refundable
    else:
        try:
            amount = Decimal(str(requested))
        except Exception:
            raise RequestError('Refund amount is not a number.')
        if not amount.is_finite() or amount < 0:
            raise RequestError('Refund amount must be zero or more.')
    amount = amount.quantize(Decimal('0.01'))
    if amount > refundable:
        raise RequestError(f'Refund cannot be more than the ₹{refundable:,.2f} still refundable.')
    if amount > 0 and not order.razorpay_payment_id:
        raise RequestError('This order has no online payment to refund.')
    return amount
