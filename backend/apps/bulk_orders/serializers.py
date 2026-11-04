import os
import re
from rest_framework import serializers
from .models import BulkOrder, BulkOrderMessage, ConversationBackupArchive, UserCheckedProduct
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

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', cleaned):
            raise serializers.ValidationError("Please provide a valid email address.")
        return cleaned


class BulkOrderDetailSerializer(serializers.ModelSerializer):
    messages = BulkOrderMessageSerializer(many=True, read_only=True)
    product_details = ProductListSerializer(source='product', read_only=True)
    checked_products_details = ProductListSerializer(source='checked_products', many=True, read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    organization_type_label = serializers.CharField(source='get_organization_type_display', read_only=True)
    attachment = serializers.SerializerMethodField()

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
            'messages', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'attachment', 'attachment_url', 'messages',
            'created_at', 'updated_at',
        ]

    def get_attachment(self, obj):
        return obj.attachment_url or None if obj.attachment else None


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
            'messages_count', 'created_at', 'updated_at'
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
