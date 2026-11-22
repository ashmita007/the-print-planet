import re
import json
import logging
from decimal import Decimal
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from apps.core.pagination import StandardResultsSetPagination
from apps.bulk_orders import razorpay, secret_box
from apps.bulk_orders.models import BulkOrder, BulkOrderMessage, PaymentGatewaySettings, QuotePayment
from apps.bulk_orders.services import client_orders_for


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Online payment of a quote (Razorpay Checkout)
# ---------------------------------------------------------------------------
# The amount always comes from the order's quoted_amount on the server. Every Razorpay order
# opened for a quote is kept as a QuotePayment, and a payment is recorded only after Razorpay
# confirms it was captured for that Razorpay order and amount, through the checkout callback
# or the webhook. A captured payment that no longer matches the quote is recorded and posted
# to the order conversation for the owner to review, never dropped.

def _payable_paise(order):
    if order.is_paid or order.status == 'cancelled' or order.payment_under_review:
        return None
    return order.quote_paise()


def _record_payment(payment):
    """Record a captured Razorpay payment against its QuotePayment. Idempotent; returns the order."""
    if not isinstance(payment, dict) or payment.get('status') != 'captured' or payment.get('currency') != 'INR':
        raise razorpay.RazorpayError('Payment is not a captured INR payment.')
    payment_id = str(payment.get('id') or '')
    with transaction.atomic():
        quote_payment = QuotePayment.objects.select_for_update().filter(
            razorpay_order_id=str(payment.get('order_id') or '')
        ).first()
        if not quote_payment:
            raise razorpay.RazorpayError(f"Captured payment {payment_id} matches no quote payment.")
        order = BulkOrder.objects.select_for_update().get(pk=quote_payment.order_id)
        if quote_payment.captured_at:
            return order
        if payment.get('amount') != quote_payment.amount_paise:
            raise razorpay.RazorpayError(f"Payment {payment_id} amount differs from its Razorpay order.")

        quote_payment.razorpay_payment_id = payment_id
        quote_payment.captured_at = timezone.now()
        quote_payment.save(update_fields=['razorpay_payment_id', 'captured_at'])

        amount = Decimal(quote_payment.amount_paise) / 100
        if order.is_paid or quote_payment.amount_paise != order.quote_paise():
            logger.warning('Payment %s for %s needs review: order paid=%s, quote changed.',
                           payment_id, order.order_number, order.is_paid)
            text = (f"Payment of ₹{amount:,.2f} received online (Razorpay {payment_id}), but it does not "
                    f"match the current quote. The Print Planet will review it and contact you.")
        else:
            order.paid_amount = amount
            order.paid_at = quote_payment.captured_at
            order.razorpay_payment_id = payment_id
            order.save(update_fields=['paid_amount', 'paid_at', 'razorpay_payment_id', 'updated_at'])
            text = f"Payment of ₹{amount:,.2f} received online (Razorpay {payment_id})."
        BulkOrderMessage.objects.create(order=order, sender_type='system', sender_name='The Print Planet', message=text)
    return order


class ClientBulkOrderPayView(APIView):
    """Opens (or reuses) a Razorpay order for the client's current quote and returns checkout details."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        order = get_object_or_404(client_orders_for(request.user), order_number=order_number)
        paise = _payable_paise(order)
        if paise is None:
            return Response({'error': 'This order has nothing to pay.'}, status=status.HTTP_400_BAD_REQUEST)
        if not razorpay.is_configured():
            return Response({'error': 'Online payment is not available yet.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        quote_payment = order.quote_payments.filter(amount_paise=paise, captured_at__isnull=True).first()
        if not quote_payment:
            try:
                rp_order = razorpay.create_order(paise, order.order_number, {'bulk_order': order.order_number})
            except razorpay.RazorpayError as exc:
                logger.error('Razorpay order creation failed for %s: %s', order.order_number, exc)
                return Response({'error': 'Could not start the payment. Please try again.'},
                                status=status.HTTP_502_BAD_GATEWAY)
            quote_payment = QuotePayment.objects.create(order=order, razorpay_order_id=rp_order['id'], amount_paise=paise)

        return Response({
            'key_id': razorpay.key_id(),
            'razorpay_order_id': quote_payment.razorpay_order_id,
            'amount': paise,
            'currency': 'INR',
            'name': 'The Print Planet',
            'description': f'Order {order.order_number}',
            'prefill': {'name': order.contact_person, 'email': order.email, 'contact': order.phone},
        })


class ClientBulkOrderPayVerifyView(APIView):
    """Checkout callback: checks the signature, then confirms the payment with Razorpay."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        order = get_object_or_404(client_orders_for(request.user), order_number=order_number)
        data = request.data if isinstance(request.data, dict) else {}
        rp_order_id, payment_id, signature = (
            str(data.get(k) or '') for k in ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')
        )
        quote_payment = order.quote_payments.filter(razorpay_order_id=rp_order_id).first()
        if not quote_payment or not razorpay.verify_payment_signature(rp_order_id, payment_id, signature):
            return Response({'error': 'Payment could not be verified.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            payment = razorpay.fetch_payment(payment_id)
            if payment.get('status') == 'authorized':
                payment = razorpay.capture_payment(payment_id, quote_payment.amount_paise)
            order = _record_payment(payment)
        except razorpay.RazorpayError as exc:
            logger.error('Razorpay verification failed for %s (%s): %s', order.order_number, payment_id, exc)
            return Response({'error': 'Payment could not be confirmed yet. If money was taken it will be '
                                      'confirmed on this order shortly, or contact us.'},
                            status=status.HTTP_502_BAD_GATEWAY)
        return Response({'paid': order.is_paid})


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    """Razorpay server-to-server events. Confirms payments even if the customer closed the page."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not razorpay.verify_webhook_signature(request.body, request.headers.get('X-Razorpay-Signature', '')):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        try:
            event = json.loads(request.body)
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(event, dict) or event.get('event') not in ('payment.captured', 'order.paid'):
            return Response({'ignored': True})
        payload = event.get('payload')
        payment = payload.get('payment') if isinstance(payload, dict) else None
        entity = payment.get('entity') if isinstance(payment, dict) else None
        try:
            _record_payment(entity)
        except razorpay.RazorpayError as exc:
            logger.error('Razorpay webhook %s not recorded: %s', event.get('event'), exc)
        return Response({'ok': True})


# ---------------------------------------------------------------------------
# Owner: payment gateway settings and received payments
# ---------------------------------------------------------------------------
WEBHOOK_PATH = '/api/v1/bulk-orders/payments/razorpay/webhook/'
RAZORPAY_KEY_ID_RE = re.compile(r'^rzp_(test|live)_[A-Za-z0-9]{6,40}$')


def _gateway_summary(request):
    saved = PaymentGatewaySettings.load()
    key, secret, webhook_secret, source = razorpay.credentials()
    stored_secret = secret_box.decrypt(saved.key_secret_encrypted)
    return {
        'enabled': saved.enabled,
        'key_id': saved.key_id,
        'mode': 'live' if saved.key_id.startswith('rzp_live_') else ('test' if saved.key_id else ''),
        'has_key_secret': bool(stored_secret),
        'key_secret_last4': stored_secret[-4:] if stored_secret else '',
        'has_webhook_secret': bool(secret_box.decrypt(saved.webhook_secret_encrypted)),
        'secrets_unreadable': bool(saved.key_secret_encrypted) and not stored_secret,
        'active_source': source,
        'active_mode': 'live' if key.startswith('rzp_live_') else ('test' if key else ''),
        'webhook_url': (f"{settings.FRONTEND_URL}{WEBHOOK_PATH}" if settings.FRONTEND_URL
                        else request.build_absolute_uri(WEBHOOK_PATH)),
        'webhook_ready': bool(webhook_secret),
        'can_store_secrets': secret_box.available(),
        'webhook_events': ['payment.captured', 'order.paid'],
        'updated_at': saved.updated_at if saved.pk else None,
    }


class OwnerPaymentSettingsView(APIView):
    """Owner reads and saves Razorpay keys. Secrets are write-only: never returned, only their last 4."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        return Response(_gateway_summary(request))

    def put(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        saved = PaymentGatewaySettings.load()
        key_id = str(data.get('key_id', saved.key_id) or '').strip()
        key_secret = str(data.get('key_secret') or '').strip()
        webhook_secret = str(data.get('webhook_secret') or '').strip()
        enabled = data.get('enabled', saved.enabled) in (True, 'true', '1', 1)

        if key_id and not RAZORPAY_KEY_ID_RE.match(key_id):
            return Response({'error': 'Key ID should look like rzp_test_... or rzp_live_...'},
                            status=status.HTTP_400_BAD_REQUEST)
        if key_secret and not re.fullmatch(r'[A-Za-z0-9]{10,64}', key_secret):
            return Response({'error': 'That Key Secret does not look right. Copy it again from Razorpay.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if (key_secret or webhook_secret) and not secret_box.available():
            return Response({'error': 'The server has no private DJANGO_SECRET_KEY set, so keys cannot be stored safely.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if len(webhook_secret) > 200:
            return Response({'error': 'Webhook secret is too long.'}, status=status.HTTP_400_BAD_REQUEST)

        secret_to_check = key_secret or secret_box.decrypt(saved.key_secret_encrypted)
        if enabled:
            if not (key_id and secret_to_check):
                return Response({'error': 'Enter the Key ID and Key Secret before turning payments on.'},
                                status=status.HTTP_400_BAD_REQUEST)
            try:
                razorpay.check_keys(key_id, secret_to_check)
            except razorpay.RazorpayError as exc:
                logger.warning('Razorpay key check failed: %s', exc)
                return Response({'error': 'Razorpay did not accept these keys. Check the Key ID and Key Secret.'},
                                status=status.HTTP_400_BAD_REQUEST)

        saved.key_id = key_id
        if key_secret:
            saved.key_secret_encrypted = secret_box.encrypt(key_secret)
        if webhook_secret:
            saved.webhook_secret_encrypted = secret_box.encrypt(webhook_secret)
        if data.get('clear_secrets') in (True, 'true', '1', 1):
            saved.key_secret_encrypted = saved.webhook_secret_encrypted = ''
            enabled = False
        saved.enabled = enabled
        saved.updated_by = request.user
        saved.save()
        logger.info('Payment gateway settings updated by %s (enabled=%s)', request.user.username, enabled)
        return Response(_gateway_summary(request))


class OwnerPaymentSettingsTestView(APIView):
    """Checks the saved (or just-typed) keys against Razorpay without saving anything."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        saved = PaymentGatewaySettings.load()
        key_id = str(data.get('key_id') or saved.key_id or '').strip()
        secret = str(data.get('key_secret') or '').strip() or secret_box.decrypt(saved.key_secret_encrypted)
        if not (key_id and secret):
            return Response({'ok': False, 'error': 'Enter the Key ID and Key Secret first.'})
        try:
            razorpay.check_keys(key_id, secret)
        except razorpay.RazorpayError as exc:
            logger.warning('Razorpay key test failed: %s', exc)
            return Response({'ok': False, 'error': 'Razorpay did not accept these keys.'})
        return Response({'ok': True, 'mode': 'live' if key_id.startswith('rzp_live_') else 'test'})


class OwnerPaymentsListView(generics.ListAPIView):
    """Recent online payment attempts across all bulk orders."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return QuotePayment.objects.select_related('order').order_by('-created_at')

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        rows = [{
            'id': qp.id,
            'order_number': qp.order.order_number,
            'organization_name': qp.order.organization_name,
            'amount': qp.amount_paise / 100,
            'razorpay_order_id': qp.razorpay_order_id,
            'razorpay_payment_id': qp.razorpay_payment_id,
            'status': ('paid' if qp.order.razorpay_payment_id == qp.razorpay_payment_id
                       else 'needs_review') if qp.captured_at else 'not_paid',
            'captured_at': qp.captured_at,
            'created_at': qp.created_at,
        } for qp in page]
        return self.get_paginated_response(rows)
