import os
import re
from rest_framework import serializers
from .models import BulkOrder, BulkOrderMessage, ConversationBackupArchive
from apps.catalog.serializers import ProductListSerializer

ALLOWED_ATTACHMENT_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
    '.jpg', '.jpeg', '.png', '.webp', '.zip', '.rar', '.ai', '.eps', '.cdr'
}
MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024  # 15 MB


class BulkOrderMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrderMessage
        fields = [
            'id', 'order', 'sender', 'sender_type', 'sender_name',
            'message', 'attachment', 'attachment_url', 'created_at'
        ]
        read_only_fields = ['id', 'order', 'sender', 'created_at']


class BulkOrderCreateSerializer(serializers.ModelSerializer):
    attachment = serializers.FileField(required=False, allow_null=True)
    attachment_url = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = BulkOrder
        fields = [
            'id', 'order_number', 'organization_type', 'organization_name',
            'contact_person', 'email', 'phone', 'city', 'state', 'gst_number',
            'category_type', 'product', 'product_name_text', 'estimated_quantity',
            'specifications', 'requirements', 'attachment', 'attachment_url'
        ]
        read_only_fields = ['id', 'order_number']

    def validate_attachment(self, file_obj):
        if not file_obj:
            return None
        if file_obj.size > MAX_ATTACHMENT_SIZE:
            raise serializers.ValidationError("Attachment exceeds maximum allowed size of 15MB.")
        ext = os.path.splitext(file_obj.name.lower())[1]
        if ext not in ALLOWED_ATTACHMENT_EXTENSIONS:
            raise serializers.ValidationError(f"File extension {ext} not allowed.")
        return file_obj

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', cleaned):
            raise serializers.ValidationError("Please provide a valid email address.")
        return cleaned


class BulkOrderDetailSerializer(serializers.ModelSerializer):
    messages = BulkOrderMessageSerializer(many=True, read_only=True)
    product_details = ProductListSerializer(source='product', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    organization_type_label = serializers.CharField(source='get_organization_type_display', read_only=True)

    class Meta:
        model = BulkOrder
        fields = [
            'id', 'order_number', 'user', 'organization_type', 'organization_type_label',
            'organization_name', 'contact_person', 'email', 'phone', 'city', 'state',
            'gst_number', 'category_type', 'product', 'product_details', 'product_name_text',
            'estimated_quantity', 'specifications', 'requirements', 'attachment',
            'attachment_url', 'status', 'status_label', 'quoted_amount', 'quote_notes',
            'tracking_consignment_number', 'tracking_courier_partner',
            'messages', 'created_at', 'updated_at'
        ]


class BulkOrderListSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    organization_type_label = serializers.CharField(source='get_organization_type_display', read_only=True)
    messages_count = serializers.IntegerField(source='messages.count', read_only=True)

    class Meta:
        model = BulkOrder
        fields = [
            'id', 'order_number', 'organization_type', 'organization_type_label',
            'organization_name', 'contact_person', 'email', 'phone', 'city',
            'category_type', 'estimated_quantity', 'status', 'status_label',
            'quoted_amount', 'tracking_consignment_number', 'tracking_courier_partner',
            'messages_count', 'created_at', 'updated_at'
        ]


class ConversationBackupArchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationBackupArchive
        fields = [
            'id', 'archive_code', 'total_orders', 'total_messages',
            'notes', 'created_at'
        ]
