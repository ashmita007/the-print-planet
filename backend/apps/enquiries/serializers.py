from rest_framework import serializers
from .models import Enquiry
from apps.catalog.serializers import ProductListSerializer


class EnquiryCreateSerializer(serializers.ModelSerializer):
    attachment = serializers.FileField(required=False, allow_null=True)
    attachment_url = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Enquiry
        fields = [
            'id', 'full_name', 'company_name', 'email', 'phone',
            'product', 'product_name_text', 'requested_quantity',
            'message', 'attachment', 'attachment_url', 'source_page'
        ]
        read_only_fields = ['id']

    def validate_phone(self, value):
        cleaned = value.strip()
        if len(cleaned) < 6:
            raise serializers.ValidationError("Please provide a valid contact number.")
        return cleaned


class EnquiryDetailSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            'id', 'full_name', 'company_name', 'email', 'phone',
            'product', 'product_name_text', 'product_details',
            'requested_quantity', 'message', 'attachment', 'attachment_url',
            'source_page', 'status', 'admin_notes', 'created_at', 'updated_at'
        ]
