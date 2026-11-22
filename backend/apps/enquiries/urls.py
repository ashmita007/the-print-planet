from django.urls import path

from .views import PublicEnquiryCreateView, OwnerEnquiryViewSet

owner_routes = [
    ('enquiries', OwnerEnquiryViewSet, 'owner-enquiries'),
]

urlpatterns = [
    path('enquiries/', PublicEnquiryCreateView.as_view(), name='public-enquiry'),
]
