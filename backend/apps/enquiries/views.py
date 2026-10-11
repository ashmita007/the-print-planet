from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Enquiry
from .serializers import EnquiryCreateSerializer, EnquiryDetailSerializer


class PublicEnquiryCreateView(generics.CreateAPIView):
    """Public customer enquiry submission endpoint."""
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryCreateSerializer
    permission_classes = [permissions.AllowAny]


class OwnerEnquiryViewSet(viewsets.ModelViewSet):
    """Owner enquiry management ViewSet."""
    queryset = Enquiry.objects.all().select_related('product')
    serializer_class = EnquiryDetailSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

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
