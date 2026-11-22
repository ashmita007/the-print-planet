import os
from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count
from django.http import FileResponse, Http404
from apps.core.pagination import StandardResultsSetPagination
from apps.bulk_orders.services import (
    QuoteLockedError,
    client_orders_for,
    parse_checked_product_ids,
    place_order,
    post_client_message,
    post_owner_reply,
)
from apps.bulk_orders.models import BulkOrder, BulkOrderMessage, UserCheckedProduct
from apps.bulk_orders.serializers import (
    BulkOrderCreateSerializer,
    BulkOrderDetailSerializer,
    BulkOrderListSerializer,
    BulkOrderMessageSerializer,
    UserCheckedProductSerializer,
    attachment_error,
)


def _attachment_response(file_field):
    if not file_field:
        raise Http404("No attachment.")
    try:
        handle = file_field.open('rb')
    except (FileNotFoundError, OSError):
        raise Http404("Attachment file is missing.")
    return FileResponse(handle, as_attachment=True, filename=os.path.basename(file_field.name))


class BulkOrderSubmitView(APIView):
    """Submits a bulk order. Anonymous buyers must sign in or create their own account."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'bulk_order'
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        token_key = None

        # Validate the order first so a bad form never leaves behind a stray account.
        serializer = BulkOrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order, user, token_key = place_order(
            request, serializer, user,
            password=str(request.data.get('password', '')).strip(),
            checked_ids=parse_checked_product_ids(request.data.get('checked_product_ids')),
        )

        user_payload = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
        return Response({
            'message': 'Bulk order inquiry submitted successfully!',
            'order_number': order.order_number,
            'token': token_key,
            'user': user_payload if token_key else None,
            'order': BulkOrderDetailSerializer(order).data,
        }, status=status.HTTP_201_CREATED)


class TrackCheckedProductView(APIView):
    """Records a product checked or browsed by an authenticated user for buyer insights."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        from apps.catalog.models import Product
        try:
            prod = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        item, created = UserCheckedProduct.objects.get_or_create(
            user=request.user,
            product=prod,
            defaults={'inquiry_count': 1}
        )
        if not created:
            item.inquiry_count += 1
            item.save(update_fields=['inquiry_count', 'viewed_at'])

        return Response({'success': True, 'checked_product_id': prod.id}, status=status.HTTP_200_OK)


class ClientCheckedProductsListView(generics.ListAPIView):
    """Lists all products previously checked by the current client."""
    serializer_class = UserCheckedProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return UserCheckedProduct.objects.filter(
            user=self.request.user
        ).select_related('product', 'product__category').prefetch_related('product__images')


class ClientBulkOrdersListView(generics.ListAPIView):
    """Returns the authenticated client's own bulk orders with status counts."""
    serializer_class = BulkOrderListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return client_orders_for(self.request.user).select_related('product').annotate(
            messages_total=Count('messages')
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        qs = client_orders_for(request.user)
        response.data['summary_metrics'] = {
            'total': qs.count(),
            'submitted': qs.filter(status='submitted').count(),
            'reviewing': qs.filter(status='reviewing').count(),
            'quoted': qs.filter(status='quoted').count(),
            'in_production': qs.filter(status__in=['proofing', 'in_production']).count(),
            'completed': qs.filter(status__in=['dispatched', 'completed']).count(),
        }
        return response


class ClientBulkOrderDetailView(generics.RetrieveAPIView):
    """Retrieves full order details and conversation for one of the client's own orders."""
    serializer_class = BulkOrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        return client_orders_for(self.request.user).select_related('product').prefetch_related('messages')


class ClientBulkOrderMessagePostView(APIView):
    """Allows the order's owner to send a message in the bulk order conversation."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, order_number):
        user = request.user
        order = client_orders_for(user).filter(order_number=order_number).first()
        if not order:
            return Response({'error': 'Bulk order not found.'}, status=status.HTTP_404_NOT_FOUND)

        msg_text = str(request.data.get('message', '')).strip()
        file_obj = request.FILES.get('attachment')
        if not msg_text and not file_obj:
            return Response({'error': 'Message content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj:
            error = attachment_error(file_obj)
            if error:
                return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        msg = post_client_message(order, user, msg_text, file_obj)

        return Response(BulkOrderMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class BulkOrderAttachmentDownloadView(APIView):
    """Streams an order's attachment to the client who placed it, or to staff."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        qs = BulkOrder.objects.all() if request.user.is_staff else client_orders_for(request.user)
        order = qs.filter(order_number=order_number).first()
        if not order:
            raise Http404("Bulk order not found.")
        return _attachment_response(order.attachment)


class BulkOrderMessageAttachmentDownloadView(APIView):
    """Streams a conversation attachment to the order's client, or to staff."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, message_id):
        qs = BulkOrderMessage.objects.select_related('order')
        if not request.user.is_staff:
            qs = qs.filter(order__user=request.user)
        msg = qs.filter(id=message_id).first()
        if not msg:
            raise Http404("Attachment not found.")
        return _attachment_response(msg.attachment)


class OwnerBulkOrderViewSet(viewsets.ModelViewSet):
    """Owner management ViewSet for all bulk orders."""
    queryset = BulkOrder.objects.all().select_related('user', 'product').prefetch_related('messages')
    serializer_class = BulkOrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        org_type = self.request.query_params.get('org_type')
        if org_type:
            qs = qs.filter(organization_type=org_type)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        q = self.request.query_params.get('search')
        if q:
            qs = qs.filter(
                Q(order_number__icontains=q) |
                Q(organization_name__icontains=q) |
                Q(contact_person__icontains=q) |
                Q(email__icontains=q) |
                Q(phone__icontains=q) |
                Q(city__icontains=q)
            )
        return qs

    def get_object(self):
        lookup = str(self.kwargs.get('pk', '')).strip()
        if lookup.isdigit():
            return super().get_object()
        obj = self.get_queryset().filter(order_number=lookup).first()
        if not obj:
            raise Http404("Bulk order not found.")
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=['post'], url_path='messages')
    def post_owner_reply(self, request, pk=None):
        order = self.get_object()
        msg_text = request.data.get('message', '').strip()
        if not msg_text:
            return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            msg = post_owner_reply(order, request.user, request.data, msg_text)
        except QuoteLockedError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': BulkOrderMessageSerializer(msg).data,
            'order': BulkOrderDetailSerializer(order).data
        }, status=status.HTTP_201_CREATED)
