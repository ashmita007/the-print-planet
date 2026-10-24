import os
import re
from rest_framework import serializers
from .models import Enquiry
from apps.catalog.serializers import ProductListSerializer

ALLOWED_ATTACHMENT_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.rtf',
    '.jpg', '.jpeg', '.png', '.webp', '.zip', '.rar', '.ai', '.eps', '.cdr', '.psd'
}

DANGEROUS_ATTACHMENT_EXTENSIONS = {
    '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.pl', '.cgi',
    '.js', '.mjs', '.ts', '.html', '.htm', '.svg', '.xhtml', '.py',
    '.vbs', '.scr', '.jar', '.war', '.apk', '.bin', '.msi', '.dll'
}

MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024  # 10 MB


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

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', cleaned):
            raise serializers.ValidationError("Please provide a valid email address.")
        return cleaned

    def validate_attachment(self, file_obj):
        if not file_obj:
            return None

        # 1. Size Validation
        if file_obj.size > MAX_ATTACHMENT_SIZE:
            raise serializers.ValidationError("Attachment exceeds maximum allowed size of 10MB.")

        # 2. Extension Validation
        filename = getattr(file_obj, 'name', '') or ''
        _, ext = os.path.splitext(filename.lower())
        if not ext or ext in DANGEROUS_ATTACHMENT_EXTENSIONS or ext not in ALLOWED_ATTACHMENT_EXTENSIONS:
            raise serializers.ValidationError(
                f"File format '{ext}' is not permitted. Supported formats: PDF, Word, Excel, JPG, PNG, WEBP, ZIP, and Vector artwork files."
            )

        # 3. Path Traversal & Name Sanitization Check
        if '..' in filename or '/' in filename or '\\' in filename:
            raise serializers.ValidationError("Invalid file name detected.")

        # 4. Content Inspection: Reject embedded scripts / PHP tags
        try:
            head = file_obj.read(512)
            file_obj.seek(0)
            if any(marker in head.lower() for marker in [b'<?php', b'<script', b'<%', b'<html']):
                raise serializers.ValidationError("Unsafe content detected inside uploaded file.")
        except Exception:
            pass

        return file_obj


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
