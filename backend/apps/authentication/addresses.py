import re

from django.db import transaction
from rest_framework import permissions, serializers, viewsets

from apps.bulk_orders.commerce import normalize_state

from .models import Address

# 2-digit state code, 10-char PAN, entity digit, 'Z', checksum character.
GSTIN_RE = re.compile(r'^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$')


def validate_gstin(value):
    value = (value or '').strip().upper()
    if value and not GSTIN_RE.match(value):
        raise serializers.ValidationError('Enter a valid 15-character GSTIN.')
    return value


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'label', 'full_name', 'phone', 'line1', 'line2', 'city', 'state', 'pincode',
            'gstin', 'is_default_shipping', 'is_default_billing', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_pincode(self, value):
        value = value.strip()
        if not re.fullmatch(r'\d{6}', value):
            raise serializers.ValidationError('Pincode must be 6 digits.')
        return value

    def validate_state(self, value):
        state = normalize_state(value)
        if not state:
            raise serializers.ValidationError('Choose a valid Indian state or union territory.')
        return state

    def validate_gstin(self, value):
        return validate_gstin(value)


class AddressViewSet(viewsets.ModelViewSet):
    """CRUD on the signed-in user's own addresses; other users' rows are simply not found."""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def _save(self, serializer, **extra):
        # One default per kind: setting a new default clears the user's previous one.
        with transaction.atomic():
            instance = serializer.save(**extra)
            others = Address.objects.filter(user=self.request.user).exclude(pk=instance.pk)
            if instance.is_default_shipping:
                others.update(is_default_shipping=False)
            if instance.is_default_billing:
                others.update(is_default_billing=False)

    def perform_create(self, serializer):
        self._save(serializer, user=self.request.user)

    def perform_update(self, serializer):
        self._save(serializer)
