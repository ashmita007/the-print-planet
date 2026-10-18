from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from apps.catalog.views import (
    CategoryListView,
    CategoryDetailView,
    ProductListView,
    ProductDetailView,
    FeaturedProductsView,
    GlobalSearchView,
    OwnerProductViewSet,
    OwnerCategoryViewSet,
    OwnerProductImageViewSet,
    OwnerImageUploadView,
    OwnerBulkImportValidateView,
    OwnerBulkImportExecuteView,
    OwnerCatalogExportExcelView,
)
from apps.enquiries.views import (
    PublicEnquiryCreateView,
    OwnerEnquiryViewSet,
)
from apps.settings_app.views import (
    PublicSiteSettingsView,
    PublicHomePageSectionsView,
    OwnerSiteSettingsView,
    OwnerHomePageSectionViewSet,
    OwnerDashboardStatsView,
)
from apps.authentication.views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView,
)

# Router for owner ViewSets
owner_router = DefaultRouter()
owner_router.register(r'products', OwnerProductViewSet, basename='owner-products')
owner_router.register(r'categories', OwnerCategoryViewSet, basename='owner-categories')
owner_router.register(r'images', OwnerProductImageViewSet, basename='owner-images')
owner_router.register(r'enquiries', OwnerEnquiryViewSet, basename='owner-enquiries')
owner_router.register(r'homepage-sections', OwnerHomePageSectionViewSet, basename='owner-homepage-sections')

from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """Ultra-fast, zero-overhead health check endpoint for UptimeRobot and Render."""
    db_ok = True
    try:
        connection.ensure_connection()
    except Exception:
        db_ok = False
    return JsonResponse({
        "status": "healthy" if db_ok else "degraded",
        "service": "The Print Planet Enterprise",
        "database": "connected" if db_ok else "error",
    }, status=200 if db_ok else 503)

urlpatterns = [
    path('healthz', health_check, name='health-check'),
    path('healthz/', health_check, name='health-check-slash'),
    path('api/healthz', health_check, name='api-health-check'),
    path('admin/', admin.site.urls),

    # OpenAPI Schema & Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Public API v1 endpoints
    path('api/v1/categories/', CategoryListView.as_view(), name='category-list'),
    path('api/v1/categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
    path('api/v1/products/', ProductListView.as_view(), name='product-list'),
    path('api/v1/products/featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('api/v1/products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('api/v1/search/', GlobalSearchView.as_view(), name='global-search'),
    path('api/v1/enquiries/', PublicEnquiryCreateView.as_view(), name='public-enquiry'),
    path('api/v1/site-settings/', PublicSiteSettingsView.as_view(), name='public-site-settings'),
    path('api/v1/homepage-sections/', PublicHomePageSectionsView.as_view(), name='public-homepage-sections'),

    # Authentication
    path('api/v1/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/v1/auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('api/v1/auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # Owner Management APIs
    path('api/v1/owner/site-settings/', OwnerSiteSettingsView.as_view(), name='owner-site-settings'),
    path('api/v1/owner/stats/', OwnerDashboardStatsView.as_view(), name='owner-stats'),
    path('api/v1/owner/images/upload/', OwnerImageUploadView.as_view(), name='owner-image-upload'),
    path('api/v1/owner/import/validate/', OwnerBulkImportValidateView.as_view(), name='owner-import-validate'),
    path('api/v1/owner/import/execute/', OwnerBulkImportExecuteView.as_view(), name='owner-import-execute'),
    path('api/v1/owner/export/excel/', OwnerCatalogExportExcelView.as_view(), name='owner-export-excel'),
    path('api/v1/owner/', include(owner_router.urls)),
]

from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
