"""Owner customer history: who ordered or enquired, and everything that passed between us."""
from decimal import Decimal

from django.contrib.auth.models import User
from django.db.models import Count, DecimalField, Exists, OuterRef, Q, Subquery, Sum
from django.db.models.functions import Coalesce, Greatest, Lower
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.addresses import AddressSerializer
from apps.bulk_orders.models import BulkOrder, OrderRequest, QuotePayment
from apps.bulk_orders.serializers import BulkOrderMessageSerializer, OrderEventSerializer
from apps.core.pagination import StandardResultsSetPagination
from apps.enquiries.models import Enquiry

OWNER = [permissions.IsAuthenticated, permissions.IsAdminUser]


def _enquiries_for(email):
    """Enquiries match by email, case-insensitively; a blank email matches nothing."""
    if not email:
        return Enquiry.objects.none()
    return Enquiry.objects.annotate(email_lower=Lower('email')).filter(email_lower=email.lower())


def _name(user):
    return user.get_full_name().strip() or user.username


class OwnerCustomersListView(generics.GenericAPIView):
    """One row per registered client with orders, or enquiries sent from their email."""
    permission_classes = OWNER
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        mine = BulkOrder.objects.filter(user=OuterRef('pk'))
        # A user with no email can still have orders; only enquiry matching needs an address.
        enquiry = (Enquiry.objects.annotate(email_lower=Lower('email'))
                   .filter(email_lower=Lower(OuterRef('email'))).exclude(email=''))
        qs = (
            User.objects.filter(is_staff=False, is_superuser=False)
            .annotate(
                has_orders=Exists(mine),
                has_enquiries=Exists(enquiry),
                orders_count=Coalesce(Subquery(
                    mine.order_by().values('user').annotate(c=Count('id')).values('c')), 0),
                paid_total=Coalesce(Subquery(
                    mine.order_by().values('user').annotate(s=Sum('paid_amount')).values('s')), Decimal('0'),
                    output_field=DecimalField(max_digits=14, decimal_places=2)),
                last_order_at=Subquery(mine.order_by('-created_at').values('created_at')[:1]),
                last_enquiry_at=Subquery(enquiry.order_by('-created_at').values('created_at')[:1]),
            )
            .filter(Q(has_orders=True) | Q(has_enquiries=True))
            .annotate(last_activity=Greatest(
                Coalesce('last_order_at', 'last_enquiry_at'), Coalesce('last_enquiry_at', 'last_order_at')))
        )
        term = self.request.query_params.get('search', '').strip()
        if term:
            qs = qs.filter(
                Q(email__icontains=term) | Q(first_name__icontains=term) | Q(last_name__icontains=term)
                | Q(username__icontains=term)
                | Exists(mine.filter(Q(organization_name__icontains=term) | Q(phone__icontains=term)
                                     | Q(contact_person__icontains=term)))
            )
        return qs.order_by('-last_activity', '-id')

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        ids = [u.pk for u in page]
        # Company and phone come from each customer's newest order (one query for the page).
        latest = {}
        for order in BulkOrder.objects.filter(user_id__in=ids).order_by('created_at').only(
                'user_id', 'organization_name', 'phone'):
            latest[order.user_id] = order
        rows = []
        for u in page:
            order = latest.get(u.pk)
            rows.append({
                'id': u.pk,
                'email': u.email,
                'name': _name(u),
                'phone': order.phone if order else '',
                'company': order.organization_name if order else '',
                'orders_count': u.orders_count,
                'paid_total': float(u.paid_total),
                'last_activity': u.last_activity,
            })
        return self.get_paginated_response(rows)


class OwnerCustomerDetailView(APIView):
    permission_classes = OWNER

    def get(self, request, user_id):
        user = get_object_or_404(User.objects.prefetch_related('addresses'), pk=user_id,
                                 is_staff=False, is_superuser=False)
        orders = list(
            BulkOrder.objects.filter(user=user).prefetch_related('messages', 'events', 'requests')
            .order_by('-created_at')
        )
        status_labels = dict(BulkOrder.STATUS_CHOICES)
        order_rows = [{
            'id': o.pk,
            'order_number': o.order_number,
            'status': o.status,
            'status_label': status_labels.get(o.status, o.status),
            'organization_name': o.organization_name,
            'phone': o.phone,
            'total': float(o.quoted_amount) if o.quoted_amount is not None else None,
            'paid': float(o.paid_amount) if o.paid_amount is not None else None,
            'paid_at': o.paid_at,
            'created_at': o.created_at,
            # Owner view: internal timeline notes included. Both lists are oldest first.
            'messages': BulkOrderMessageSerializer(o.messages.all(), many=True).data,
            'timeline': OrderEventSerializer(o.events.all(), many=True).data,
        } for o in orders]
        refunds = [{
            'order_number': o.order_number,
            'kind': r.kind,
            'status': r.status,
            'refund_amount': float(r.refund_amount) if r.refund_amount is not None else None,
            'razorpay_refund_id': r.razorpay_refund_id,
            'decided_at': r.decided_at,
        } for o in orders for r in o.requests.all() if r.refund_amount is not None or r.razorpay_refund_id]
        payments = [{
            'order_number': qp.order.order_number,
            'amount': qp.amount_paise / 100,
            'razorpay_payment_id': qp.razorpay_payment_id,
            'captured_at': qp.captured_at,
            'created_at': qp.created_at,
        } for qp in QuotePayment.objects.filter(order__user=user).select_related('order')]
        enquiries = [{
            'id': e.pk,
            'full_name': e.full_name,
            'company_name': e.company_name,
            'phone': e.phone,
            'product_name': e.product_name_text,
            'requested_quantity': e.requested_quantity,
            'message': e.message,
            'status': e.status,
            'created_at': e.created_at,
        } for e in _enquiries_for(user.email).order_by('-created_at')]
        latest = orders[0] if orders else None
        return Response({
            'profile': {
                'id': user.pk,
                'email': user.email,
                'name': _name(user),
                'phone': latest.phone if latest else (enquiries[0]['phone'] if enquiries else ''),
                'company': latest.organization_name if latest else '',
                'joined_at': user.date_joined,
                'orders_count': len(orders),
                'paid_total': float(sum((o.paid_amount or 0) for o in orders)),
            },
            'addresses': AddressSerializer(user.addresses.all(), many=True).data,
            'orders': order_rows,
            'enquiries': enquiries,
            'payments': payments,
            'refunds': refunds,
        })
