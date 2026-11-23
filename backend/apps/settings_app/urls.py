from django.urls import path

from .views import (
    PublicSiteSettingsView,
    PublicHomePageSectionsView,
    OwnerSiteSettingsView,
    OwnerHomePageSectionViewSet,
    OwnerDashboardStatsView,
    OwnerCloudDatabaseSyncView,
    OwnerEmailDiagnosticsView,
    PublicGoogleReviewView,
    OwnerGoogleReviewView,
    OwnerGoogleReviewSyncView,
    OwnerCommerceSettingsView,
    PublicCommercePoliciesView,
)

owner_routes = [
    ('homepage-sections', OwnerHomePageSectionViewSet, 'owner-homepage-sections'),
]

urlpatterns = [
    path('site-settings/', PublicSiteSettingsView.as_view(), name='public-site-settings'),
    path('google-reviews/', PublicGoogleReviewView.as_view(), name='public-google-reviews'),
    path('homepage-sections/', PublicHomePageSectionsView.as_view(), name='public-homepage-sections'),
    path('owner/site-settings/', OwnerSiteSettingsView.as_view(), name='owner-site-settings'),
    path('owner/google-reviews/', OwnerGoogleReviewView.as_view(), name='owner-google-reviews'),
    path('owner/google-reviews/sync/', OwnerGoogleReviewSyncView.as_view(), name='owner-google-reviews-sync'),
    path('commerce-policies/', PublicCommercePoliciesView.as_view(), name='public-commerce-policies'),
    path('owner/commerce-settings/', OwnerCommerceSettingsView.as_view(), name='owner-commerce-settings'),
    path('owner/stats/', OwnerDashboardStatsView.as_view(), name='owner-stats'),
    path('owner/email/diagnostics/', OwnerEmailDiagnosticsView.as_view(), name='owner-email-diagnostics'),
    path('owner/backup/cloud/', OwnerCloudDatabaseSyncView.as_view(), name='owner-backup-cloud'),
]
