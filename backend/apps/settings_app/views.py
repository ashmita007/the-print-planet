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
    """Owner configuration endpoint for store identity, contact, social links."""
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
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
