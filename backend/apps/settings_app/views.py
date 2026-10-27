from django.conf import settings
from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import SiteSettings, HomePageSection
from .serializers import SiteSettingsSerializer, HomePageSectionSerializer
from apps.catalog.models import Product, Category
from apps.catalog.serializers import ProductListSerializer
from apps.enquiries.models import Enquiry
from apps.enquiries.serializers import EnquiryDetailSerializer


class PublicSiteSettingsView(generics.RetrieveAPIView):
    """Retrieve public store identity, contact info, and branding."""
    serializer_class = SiteSettingsSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return SiteSettings.get_settings()


class PublicHomePageSectionsView(generics.ListAPIView):
    """List active configured homepage sections."""
    serializer_class = HomePageSectionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return HomePageSection.objects.filter(is_active=True).order_by('display_order', 'id')


class OwnerSiteSettingsView(APIView):
    """Owner configuration endpoint for store identity, contact, social links, hero, and about CMS."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            try:
                from apps.catalog.backup_service import trigger_auto_backup_async
                trigger_auto_backup_async(force=True)
            except Exception:
                pass
            return Response(serializer.data)
        
        # Flatten and humanize validation error messages
        err_list = []
        for field, messages in serializer.errors.items():
            if isinstance(messages, list):
                err_list.append(f"{field}: {' '.join(str(m) for m in messages)}")
            else:
                err_list.append(f"{field}: {messages}")
        error_summary = " | ".join(err_list) if err_list else "Validation failed"
        return Response({'error': error_summary, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        return self.put(request)


class OwnerHomePageSectionViewSet(viewsets.ModelViewSet):
    """Owner homepage sections management."""
    queryset = HomePageSection.objects.all().order_by('display_order', 'id')
    serializer_class = HomePageSectionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    pagination_class = None


class OwnerDashboardStatsView(APIView):
    """Live analytics and counters for the owner dashboard."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        total_categories = Category.objects.count()
        active_categories = Category.objects.filter(is_active=True).count()
        total_enquiries = Enquiry.objects.count()
        new_enquiries = Enquiry.objects.filter(status='new').count()
        in_progress_enquiries = Enquiry.objects.filter(status='in_progress').count()

        recent_enquiries = Enquiry.objects.all()[:5]
        recent_products = Product.objects.all().order_by('-updated_at')[:6]

        return Response({
            'metrics': {
                'total_products': total_products,
                'active_products': active_products,
                'total_categories': total_categories,
                'active_categories': active_categories,
                'total_enquiries': total_enquiries,
                'new_enquiries': new_enquiries,
                'in_progress_enquiries': in_progress_enquiries,
            },
            'recent_enquiries': EnquiryDetailSerializer(recent_enquiries, many=True).data,
            'recent_products': ProductListSerializer(recent_products, many=True).data,
        })


class OwnerEmailDiagnosticsView(APIView):
    """Owner-only email configuration check and real test delivery endpoint."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        from apps.enquiries.email_diagnostics import diagnose_email_delivery
        return Response(diagnose_email_delivery())

    def post(self, request):
        from apps.enquiries.email_diagnostics import send_diagnostic_email, get_owner_recipient
        to_email = (request.data.get('to') or get_owner_recipient()).strip()
        if '@' not in to_email:
            return Response({'error': 'A valid recipient email address is required.'}, status=status.HTTP_400_BAD_REQUEST)
        result = send_diagnostic_email(to_email)
        return Response(result, status=status.HTTP_200_OK if result.get('ok') else status.HTTP_502_BAD_GATEWAY)


class OwnerCloudDatabaseSyncView(APIView):
    """Allows owner to manually trigger SQLite database backup or restore to/from Cloudinary."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        action = request.data.get('action', 'backup')
        from django.core.management import call_command
        try:
            if action == 'restore':
                call_command('sync_sqlite_cloud', restore=True)
                return Response({'status': 'success', 'message': 'Database successfully restored from Cloudinary!'})
            else:
                call_command('sync_sqlite_cloud', backup=True)
                return Response({'status': 'success', 'message': 'Database successfully backed up to Cloudinary!'})
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
