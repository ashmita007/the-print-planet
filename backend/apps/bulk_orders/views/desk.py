"""Quote-first commerce endpoints: invoice, cancel/return requests, owner quote builder, status and requests desk."""
import logging
from decimal import Decimal, InvalidOperation

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bulk_orders import fulfilment, razorpay
from apps.bulk_orders.commerce import QuoteError
from apps.bulk_orders.models import BulkOrder, OrderRequest
from apps.bulk_orders.serializers import BulkOrderDetailSerializer, InvoiceSerializer, OrderRequestSerializer
from apps.bulk_orders.services import client_orders_for
from apps.core.pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)
OWNER = [permissions.IsAuthenticated, permissions.IsAdminUser]


def _detail(order):
    """Serialize from a fresh query: the viewset's prefetched timeline predates the change just made."""
    fresh = (BulkOrder.objects.select_related('product', 'invoice')
             .prefetch_related('messages', 'events', 'requests__order').get(pk=order.pk))
    return BulkOrderDetailSerializer(fresh, context={'owner': True}).data


def _bad(message):
    return Response({'error': str(message)}, status=status.HTTP_400_BAD_REQUEST)


class ClientInvoiceView(APIView):
    """The invoice JSON for one of the client's own paid orders."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        order = get_object_or_404(client_orders_for(request.user), order_number=order_number)
        invoice = getattr(order, 'invoice', None)
        if not invoice:
            return Response({'error': 'No invoice has been issued for this order yet.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InvoiceSerializer(invoice).data)


class ClientOrderRequestView(APIView):
    """The client asks to cancel an order or return a delivered one."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        order = get_object_or_404(client_orders_for(request.user), order_number=order_number)
        data = request.data if isinstance(request.data, dict) else {}
        try:
            req = fulfilment.create_request(order, str(data.get('kind') or ''), str(data.get('reason') or ''))
        except fulfilment.RequestError as exc:
            return _bad(exc)
        return Response(OrderRequestSerializer(req).data, status=status.HTTP_201_CREATED)


class OwnerRequestsListView(generics.ListAPIView):
    permission_classes = OWNER
    serializer_class = OrderRequestSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = OrderRequest.objects.select_related('order')
        wanted = self.request.query_params.get('status')
        return qs.filter(status=wanted) if wanted else qs


class OwnerRequestDecideView(APIView):
    permission_classes = OWNER

    def post(self, request, pk):
        get_object_or_404(OrderRequest, pk=pk)
        data = request.data if isinstance(request.data, dict) else {}
        try:
            req = fulfilment.decide_request(
                pk, str(data.get('decision') or ''), owner_note=str(data.get('owner_note') or ''),
                refund_amount=data.get('refund_amount'),
            )
        except fulfilment.RequestError as exc:
            return _bad(exc)
        except razorpay.RazorpayError as exc:
            logger.error('Refund for request %s failed: %s', pk, exc)
            return Response({'error': 'Razorpay could not process the refund. Nothing was changed; try again.'},
                            status=status.HTTP_502_BAD_GATEWAY)
        return Response(OrderRequestSerializer(req).data)


def advance_status(order, data, user):
    """Owner moves an order forward, optionally with courier and tracking number."""
    new_status = str(data.get('status') or '')
    if new_status not in dict(BulkOrder.STATUS_CHOICES):
        return _bad('Choose a valid status.')
    if new_status == 'paid':
        return _bad('An order becomes paid only when the online payment is captured.')
    try:
        fulfilment.change_status(
            order, new_status, 'owner', note=str(data.get('note') or ''),
            courier=str(data.get('courier') or '').strip(), awb=str(data.get('awb') or '').strip(),
        )
    except fulfilment.InvalidTransition as exc:
        return _bad(exc)
    return Response(_detail(order))


def build_quote(order, data, user):
    """Owner enters the subtotal; the server adds shipping and GST. `preview` returns numbers without saving."""
    try:
        try:
            subtotal = Decimal(str(data.get('subtotal')).strip())
        except (InvalidOperation, AttributeError):
            return _bad('Enter the subtotal as a number.')
        if not subtotal.is_finite():
            return _bad('Enter the subtotal as a number.')
        gst_rate = data.get('gst_rate')
        try:
            gst_rate = Decimal(str(gst_rate)) if gst_rate not in (None, '') else None
        except InvalidOperation:
            return _bad('GST rate must be a number.')
        if gst_rate is not None and not (gst_rate.is_finite() and 0 <= gst_rate <= 100):
            return _bad('GST rate must be between 0 and 100.')
        if data.get('preview') in (True, 'true', '1', 1):
            quote = fulfilment.preview_quote(order, subtotal, gst_rate)
            return Response({k: str(v) for k, v in quote.items()})
        line_notes = data.get('line_notes')
        if line_notes is not None and not isinstance(line_notes, list):
            return _bad('Line notes must be a list.')
        fulfilment.apply_quote(order, subtotal, 'owner', gst_rate=gst_rate, line_notes=line_notes,
                               note=str(data.get('notes') or ''))
    except (QuoteError, fulfilment.InvalidTransition) as exc:
        return _bad(exc)
    return Response(_detail(order))


def issue_invoice(order, user):
    if not order.is_paid:
        return _bad('Invoices are issued for paid orders only.')
    try:
        fulfilment.issue_invoice(order)
    except fulfilment.InvoiceBlocked as exc:
        return _bad(exc)
    return Response(_detail(order))
