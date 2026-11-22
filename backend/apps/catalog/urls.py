from django.urls import path

from .views import (
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
    OwnerDatabaseBackupEmailView,
    OwnerDatabaseBackupDownloadView,
)

# Mounted at api/v1/. ViewSets are registered on the shared owner router (apps.core.urls).
owner_routes = [
    ('products', OwnerProductViewSet, 'owner-products'),
    ('categories', OwnerCategoryViewSet, 'owner-categories'),
    ('images', OwnerProductImageViewSet, 'owner-images'),
]

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('owner/images/upload/', OwnerImageUploadView.as_view(), name='owner-image-upload'),
    path('owner/import/validate/', OwnerBulkImportValidateView.as_view(), name='owner-import-validate'),
    path('owner/import/execute/', OwnerBulkImportExecuteView.as_view(), name='owner-import-execute'),
    path('owner/export/excel/', OwnerCatalogExportExcelView.as_view(), name='owner-export-excel'),
    path('owner/backup/email/', OwnerDatabaseBackupEmailView.as_view(), name='owner-backup-email'),
    path('owner/backup/download/', OwnerDatabaseBackupDownloadView.as_view(), name='owner-backup-download'),
]
