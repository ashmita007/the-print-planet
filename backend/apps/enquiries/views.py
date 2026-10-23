from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from apps.catalog.views import StandardResultsSetPagination
from .models import Enquiry
from .serializers import EnquiryCreateSerializer, EnquiryDetailSerializer
from .services import trigger_enquiry_notifications


class PublicEnquiryCreateView(generics.CreateAPIView):
    """Public customer enquiry submission endpoint with automated email alerts."""
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryCreateSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        enquiry = serializer.save()
        trigger_enquiry_notifications(enquiry)
        from apps.catalog.backup_service import trigger_auto_backup_async
        trigger_auto_backup_async(force=True)


class OwnerEnquiryViewSet(viewsets.ModelViewSet):
    """Owner enquiry management ViewSet."""
    queryset = Enquiry.objects.all().select_related('product')
    serializer_class = EnquiryDetailSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def perform_update(self, serializer):
        serializer.save()
        from apps.catalog.backup_service import trigger_auto_backup_async
        trigger_auto_backup_async(force=True)

    def perform_destroy(self, instance):
        instance.delete()
        from apps.catalog.backup_service import trigger_auto_backup_async
        trigger_auto_backup_async(force=True)

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        q = self.request.query_params.get('search')
        if q:
            qs = qs.filter(
                Q(full_name__icontains=q) |
                Q(company_name__icontains=q) |
                Q(email__icontains=q) |
                Q(phone__icontains=q) |
                Q(message__icontains=q)
            )
        return qs
