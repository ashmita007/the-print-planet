import os
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from django.http import FileResponse, Http404
from apps.catalog.views import StandardResultsSetPagination
from .models import Enquiry
from .serializers import EnquiryCreateSerializer, EnquiryDetailSerializer
from .services import trigger_enquiry_notifications


class PublicEnquiryCreateView(generics.CreateAPIView):
    """Public customer enquiry submission endpoint with automated email alerts and optional attachments."""
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryCreateSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        enquiry = serializer.save()
        if enquiry.attachment and not enquiry.attachment_url:
            try:
                enquiry.attachment_url = f"/api/v1/owner/enquiries/{enquiry.id}/attachment/"
                enquiry.save(update_fields=['attachment_url'])
            except Exception:
                pass
        trigger_enquiry_notifications(enquiry)
        from apps.catalog.backup_service import trigger_auto_backup_async
        trigger_auto_backup_async(force=True)


class OwnerEnquiryViewSet(viewsets.ModelViewSet):
    """Owner enquiry management ViewSet."""
    queryset = Enquiry.objects.all().select_related('product')
    serializer_class = EnquiryDetailSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=['get'], url_path='attachment', permission_classes=[permissions.IsAuthenticated, permissions.IsAdminUser])
    def download_attachment(self, request, pk=None):
        """Secure authenticated attachment download endpoint enforcing least-privilege owner access."""
        enquiry = self.get_object()
        if not enquiry.attachment:
            raise Http404("No attachment associated with this enquiry.")
        try:
            file_handle = enquiry.attachment.open('rb')
            filename = os.path.basename(enquiry.attachment.name)
            response = FileResponse(file_handle, as_attachment=True, filename=filename)
            response['X-Content-Type-Options'] = 'nosniff'
            return response
        except (FileNotFoundError, ValueError):
            raise Http404("Attachment file does not exist on storage.")

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
