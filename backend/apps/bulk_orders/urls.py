from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BulkOrderSubmitView,
    ClientBulkOrdersListView,
    ClientBulkOrderDetailView,
    ClientBulkOrderMessagePostView,
    TrackCheckedProductView,
    ClientCheckedProductsListView,
    OwnerBulkOrderViewSet,
    OwnerConversationBackupDownloadView,
    OwnerConversationBackupCreateSnapshotView,
)

owner_bulk_router = DefaultRouter()
owner_bulk_router.register(r'orders', OwnerBulkOrderViewSet, basename='owner-bulk-orders')

urlpatterns = [
    # Public & Buyer client endpoints
    path('submit/', BulkOrderSubmitView.as_view(), name='bulk-order-submit'),
    path('my-orders/', ClientBulkOrdersListView.as_view(), name='client-bulk-orders-list'),
    path('my-orders/<str:order_number>/', ClientBulkOrderDetailView.as_view(), name='client-bulk-order-detail'),
    path('my-orders/<str:order_number>/messages/', ClientBulkOrderMessagePostView.as_view(), name='client-bulk-order-message-post'),
    path('track-checked-product/<int:product_id>/', TrackCheckedProductView.as_view(), name='track-checked-product'),
    path('checked-products/', ClientCheckedProductsListView.as_view(), name='client-checked-products'),

    # Owner management and backup endpoints
    path('owner/backup/download/', OwnerConversationBackupDownloadView.as_view(), name='owner-conversation-backup-download'),
    path('owner/backup/snapshot/', OwnerConversationBackupCreateSnapshotView.as_view(), name='owner-conversation-backup-snapshot'),
    path('owner/', include(owner_bulk_router.urls)),
]
