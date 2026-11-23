"""Order logic with no request/response handling; the views call these."""
import json
import secrets
from decimal import Decimal, InvalidOperation

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework.authtoken.models import Token

from apps.catalog.models import Product
from apps.core.users import unique_username_for
from . import fulfilment
from .models import BulkOrder, BulkOrderMessage
from .serializers import safe_link


class QuoteLockedError(Exception):
    """The quote was already paid online and must not change."""


def client_orders_for(user):
    """Orders a client may see: strictly the ones their own account placed.

    Matching on the order's email field let anyone who registered, or typed, a
    victim's address read that victim's orders, so ownership is the user FK only.
    """
    return BulkOrder.objects.filter(user=user)


def parse_checked_product_ids(raw):
    if not raw:
        return []
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except (ValueError, TypeError):
            raw = raw.split(',')
    if not isinstance(raw, (list, tuple)):
        raw = [raw]
    ids = []
    for value in raw:
        try:
            ids.append(int(str(value).strip()))
        except (TypeError, ValueError):
            continue
    return ids


def _token_for(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def _buyer_for_new_order(request, email, contact_person, password):
    """Find or create the account an anonymous buyer's order is filed under; returns (user, token_key)."""
    existing_user = User.objects.filter(email__iexact=email).first()
    if existing_user:
        # Only the account's own password may sign in here; typing someone's email
        # (the owner's included) must never hand back their login token.
        # The order is still accepted and filed under that account, but without the
        # right password no token comes back.
        auth_user = authenticate(request, username=existing_user.username, password=password) if password else None
        user = auth_user or existing_user
        return user, (_token_for(user) if auth_user else None)

    names = contact_person.split()
    candidate = User(
        username=unique_username_for(email),
        email=email,
        first_name=names[0] if names else '',
        last_name=' '.join(names[1:]),
    )
    if password:
        try:
            validate_password(password, user=candidate)
        except DjangoValidationError:
            pass
        candidate.set_password(password)
    else:
        candidate.set_password(secrets.token_urlsafe(16))
    candidate.save()
    return candidate, _token_for(candidate)


def place_order(request, serializer, user, password, checked_ids, extra=None):
    """Save a validated order with its first two conversation messages. Returns (order, user, token_key)."""
    with transaction.atomic():
        if not user:
            email = serializer.validated_data['email']
            contact_person = serializer.validated_data.get('contact_person', '').strip()
            user, token_key = _buyer_for_new_order(request, email, contact_person, password)
        else:
            token_key = _token_for(user)

        order = serializer.save(user=user, **(extra or {}))
        fulfilment.record_event(order, 'customer', note='Quote request submitted.')

        if checked_ids:
            order.checked_products.set(Product.objects.filter(id__in=checked_ids, is_active=True))

        if order.attachment:
            order.attachment_url = f"/api/v1/bulk-orders/my-orders/{order.order_number}/attachment/"
            order.save(update_fields=['attachment_url'])

        BulkOrderMessage.objects.create(
            order=order,
            sender=user,
            sender_type='client',
            sender_name=order.contact_person or user.get_full_name() or user.username,
            message=(
                f"Bulk Order Inquiry initiated for {order.organization_name} ({order.get_organization_type_display()}).\n"
                f"Quantity: {order.estimated_quantity} units | Category: {order.category_type}.\n\n"
                f"Requirements:\n{order.requirements}"
            ),
            attachment_url=order.attachment_url or '',
        )
        BulkOrderMessage.objects.create(
            order=order,
            sender=None,
            sender_type='system',
            sender_name='Print Planet Systems',
            message=(
                f"Thank you for your bulk inquiry #{order.order_number}! Our factory technical team at "
                f"Sunkadakatte, Bangalore is reviewing your specifications. A formal B2B quotation and "
                f"spec verification will be posted directly to this conversation thread within 2–4 business hours."
            ),
        )
    return order, user, token_key


def post_client_message(order, user, text, file_obj):
    msg = BulkOrderMessage.objects.create(
        order=order,
        sender=user,
        sender_type='client',
        sender_name=order.contact_person or user.get_full_name() or user.username,
        message=text or f"Shared a file: {file_obj.name}",
        attachment=file_obj,
    )
    if file_obj:
        msg.attachment_url = f"/api/v1/bulk-orders/messages/{msg.id}/attachment/"
        msg.save(update_fields=['attachment_url'])
    return msg


def post_owner_reply(order, owner, data, text):
    """Apply the status / quote / tracking changes in `data`, then post the reply. Raises QuoteLockedError."""
    new_status = data.get('status')
    if new_status and new_status in dict(BulkOrder.STATUS_CHOICES):
        if new_status == 'paid':
            raise fulfilment.InvalidTransition('An order becomes paid only when the online payment is captured.')
    else:
        new_status = None
    quoted_amt = data.get('quoted_amount')
    new_quote = None
    if quoted_amt is not None and str(quoted_amt).strip() != '':
        try:
            new_quote = Decimal(str(quoted_amt).strip())
        except InvalidOperation:
            new_quote = None
        if new_quote is not None and new_quote.is_finite():
            if order.is_paid and new_quote != order.quoted_amount:
                raise QuoteLockedError('This quote has already been paid online and cannot be changed.')
        else:
            new_quote = None

    with transaction.atomic():
        if new_quote is not None and new_quote != order.quoted_amount:
            order.quoted_amount = new_quote
            # A hand-typed total no longer matches any computed breakdown.
            for field in ('quote_subtotal', 'quote_shipping', 'quote_gst_rate', 'quote_tax',
                          'quote_cgst', 'quote_sgst', 'quote_igst'):
                setattr(order, field, None)
        order.save(update_fields=[
            'quoted_amount', 'quote_subtotal', 'quote_shipping', 'quote_gst_rate', 'quote_tax',
            'quote_cgst', 'quote_sgst', 'quote_igst', 'updated_at',
        ])
        courier = data.get('tracking_courier_partner') or ''
        tracking_num = data.get('tracking_consignment_number') or ''
        if new_status or courier or tracking_num:
            fulfilment.change_status(order, new_status or order.status, 'owner', courier=courier, awb=tracking_num)

    return BulkOrderMessage.objects.create(
        order=order,
        sender=owner,
        sender_type='owner',
        sender_name="The Print Planet Support",
        message=text,
        attachment_url=safe_link(data.get('attachment_url', '')),
    )
