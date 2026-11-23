import os
import re
from rest_framework import serializers
from . import razorpay
from .commerce import TRANSITIONS, can_transition
from .models import (
    BulkOrder, BulkOrderMessage, ConversationBackupArchive, Invoice, OrderEvent, OrderRequest, UserCheckedProduct,
)
from apps.catalog.serializers import ProductListSerializer

ALLOWED_ATTACHMENT_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
    '.jpg', '.jpeg', '.png', '.webp', '.zip', '.rar', '.ai', '.eps', '.cdr'
}
MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024  # 15 MB


def attachment_error(file_obj):
    """Returns a user-facing error for a disallowed upload, or '' when it is fine."""
    if file_obj.size > MAX_ATTACHMENT_SIZE:
        return "Attachment exceeds maximum allowed size of 15MB."
    ext = os.path.splitext(file_obj.name.lower())[1]
    if ext not in ALLOWED_ATTACHMENT_EXTENSIONS:
        return f"File extension {ext or '(none)'} not allowed."
    return ''


def safe_link(value):
    """Keeps only same-site paths and http(s) links, so stored links cannot run script."""
    value = str(value or '').strip()
    if value.startswith('/') and not value.startswith('//'):
        return value
    if re.match(r'^https?://', value, re.IGNORECASE):
        return value
    return ''


class BulkOrderMessageSerializer(serializers.ModelSerializer):
    # Raw media paths are private; downloads go through the authorised attachment_url.
    attachment = serializers.SerializerMethodField()

    class Meta:
        model = BulkOrderMessage
        fields = [
            'id', 'order', 'sender', 'sender_type', 'sender_name',
            'message', 'attachment', 'attachment_url', 'created_at'
        ]
        read_only_fields = fields

    def get_attachment(self, obj):
        return obj.attachment_url or None if obj.attachment else None


class BulkOrderCreateSerializer(serializers.ModelSerializer):
    attachment = serializers.FileField(required=False, allow_null=True)
    estimated_quantity = serializers.IntegerField(min_value=1, max_value=10_000_000)

    class Meta:
        model = BulkOrder
        fields = [
            'id', 'order_number', 'organization_type', 'organization_name',
            'contact_person', 'email', 'phone', 'city', 'state', 'gst_number',
            'category_type', 'product', 'product_name_text', 'estimated_quantity',
            'specifications', 'requirements', 'attachment'
        ]
        read_only_fields = ['id', 'order_number']

    def validate_attachment(self, file_obj):
        if not file_obj:
            return None
        error = attachment_error(file_obj)
        if error:
            raise serializers.ValidationError(error)
        return file_obj

    def validate_product(self, product):
        if product is not None and product.stock_quantity == 0:
            raise serializers.ValidationError(f'{product.name} is out of stock.')
        return product

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', cleaned):
            raise serializers.ValidationError("Please provide a valid email address.")
        return cleaned


class OrderEventSerializer(serializers.ModelSerializer):
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = OrderEvent
        fields = ['id', 'status', 'status_label', 'note', 'courier', 'awb', 'actor', 'internal', 'created_at']
        read_only_fields = fields

    def get_status_label(self, obj):
        return dict(BulkOrder.STATUS_CHOICES).get(obj.status, obj.status)


class OrderRequestSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    organization_name = serializers.CharField(source='order.organization_name', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    paid_amount = serializers.DecimalField(source='order.paid_amount', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderRequest
        fields = [
            'id', 'order_number', 'organization_name', 'order_status', 'paid_amount', 'kind', 'reason', 'status',
            'refund_amount', 'razorpay_refund_id', 'owner_note', 'decided_at', 'created_at',
        ]
        read_only_fields = fields


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['number', 'financial_year', 'issued_at', 'snapshot']
        read_only_fields = fields


class BulkOrderDetailSerializer(serializers.ModelSerializer):
    messages = BulkOrderMessageSerializer(many=True, read_only=True)
    product_details = ProductListSerializer(source='product', read_only=True)
    checked_products_details = ProductListSerializer(source='checked_products', many=True, read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    organization_type_label = serializers.CharField(source='get_organization_type_display', read_only=True)
    attachment = serializers.SerializerMethodField()
    is_paid = serializers.BooleanField(read_only=True)
    payment_under_review = serializers.BooleanField(read_only=True)
    can_pay_online = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    allowed_next = serializers.SerializerMethodField()
    requests = OrderRequestSerializer(many=True, read_only=True)
    invoice = serializers.SerializerMethodField()

    class Meta:
        model = BulkOrder
        fields = [
            'id', 'order_number', 'user', 'organization_type', 'organization_type_label',
            'organization_name', 'contact_person', 'email', 'phone', 'city', 'state',
            'gst_number', 'category_type', 'product', 'product_details', 'product_name_text',
            'checked_products', 'checked_products_details',
            'estimated_quantity', 'specifications', 'requirements', 'attachment',
            'attachment_url', 'status', 'status_label', 'quoted_amount', 'quote_notes',
            'tracking_consignment_number', 'tracking_courier_partner',
            'is_paid', 'paid_amount', 'paid_at', 'razorpay_payment_id', 'can_pay_online', 'payment_under_review',
            'shipping_address', 'billing_address', 'quote_subtotal', 'quote_shipping', 'quote_gst_rate',
            'quote_tax', 'quote_cgst', 'quote_sgst', 'quote_igst', 'quote_line_notes',
            'timeline', 'allowed_next', 'requests', 'invoice',
            'messages', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'attachment', 'attachment_url', 'messages',
            'shipping_address', 'billing_address', 'quote_subtotal', 'quote_shipping', 'quote_gst_rate',
            'quote_tax', 'quote_cgst', 'quote_sgst', 'quote_igst', 'quote_line_notes',
            'paid_amount', 'paid_at', 'razorpay_payment_id', 'quoted_amount',
            'created_at', 'updated_at',
        ]

    def get_attachment(self, obj):
        return obj.attachment_url or None if obj.attachment else None

    def get_can_pay_online(self, obj):
        return (razorpay.is_configured() and not obj.is_paid and obj.status == 'quoted'
                and obj.quote_paise() is not None and not obj.payment_under_review)

    def _is_owner_view(self):
        request = self.context.get('request')
        return bool(self.context.get('owner') or (request and request.user.is_authenticated and request.user.is_staff))

    def get_timeline(self, obj):
        events = list(obj.events.all())  # prefetched; filtered here so the queryset stays shared
        if not self._is_owner_view():
            events = [e for e in events if not e.internal]
        return OrderEventSerializer(events, many=True).data

    def get_allowed_next(self, obj):
        """Statuses the owner may pick next; 'paid' only ever comes from a captured payment."""
        order = ['submitted', 'reviewing', 'quoted', 'paid', 'proofing', 'in_production', 'dispatched',
                 'completed', 'cancelled', 'returned']
        return [s for s in order if s in TRANSITIONS.get(obj.status, set()) and s != 'paid']

    def get_invoice(self, obj):
        invoice = getattr(obj, 'invoice', None)
        return {'number': invoice.number, 'issued_at': invoice.issued_at} if invoice else None

    def validate_status(self, value):
        if self.instance and value != self.instance.status:
            if value == 'paid':
                raise serializers.ValidationError('An order becomes paid only when the online payment is captured.')
            if not can_transition(self.instance.status, value):
                raise serializers.ValidationError(f'Cannot move an order from {self.instance.status} to {value}.')
        return value


class UserCheckedProductSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)

    class Meta:
        model = UserCheckedProduct
        fields = ['id', 'product', 'product_details', 'viewed_at', 'inquiry_count']


class BulkOrderListSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    organization_type_label = serializers.CharField(source='get_organization_type_display', read_only=True)
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = BulkOrder
        fields = [
            'id', 'order_number', 'organization_type', 'organization_type_label',
            'organization_name', 'contact_person', 'email', 'phone', 'city',
            'category_type', 'estimated_quantity', 'status', 'status_label',
            'quoted_amount', 'tracking_consignment_number', 'tracking_courier_partner',
            'is_paid', 'paid_amount', 'messages_count', 'created_at', 'updated_at'
        ]

    def get_messages_count(self, obj):
        annotated = getattr(obj, 'messages_total', None)
        return annotated if annotated is not None else obj.messages.count()


class ConversationBackupArchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationBackupArchive
        fields = [
            'id', 'archive_code', 'total_orders', 'total_messages',
            'notes', 'created_at'
        ]
