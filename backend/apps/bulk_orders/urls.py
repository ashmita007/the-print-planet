from django.urls import path
from .views import (
    BulkOrderSubmitView,
    ClientBulkOrdersListView,
    ClientBulkOrderDetailView,
    ClientBulkOrderMessagePostView,
    ClientBulkOrderPayView,
    ClientBulkOrderPayVerifyView,
    RazorpayWebhookView,
    OwnerPaymentSettingsView,
    OwnerPaymentSettingsTestView,
    OwnerPaymentsListView,
    BulkOrderAttachmentDownloadView,
    BulkOrderMessageAttachmentDownloadView,
    TrackCheckedProductView,
    ClientCheckedProductsListView,
    OwnerBulkOrderViewSet,
    OwnerConversationBackupDownloadView,
    OwnerConversationBackupCreateSnapshotView,
    ClientInvoiceView,
    ClientOrderRequestView,
    OwnerRequestsListView,
    OwnerRequestDecideView,
    OwnerCustomersListView,
    OwnerCustomerDetailView,
)

# Registered on the shared owner router (apps.core.urls) at api/v1/owner/bulk-orders/.
owner_routes = [
    ('bulk-orders', OwnerBulkOrderViewSet, 'owner-bulk-orders'),
]

# Extra owner paths, mounted at api/v1/owner/ ahead of the router.
owner_urlpatterns = [
    path('backup/conversations/', OwnerConversationBackupDownloadView.as_view(), name='owner-backup-conversations'),
    path('backup/snapshot/', OwnerConversationBackupCreateSnapshotView.as_view(), name='owner-conversation-backup-snapshot'),
    path('payment-settings/', OwnerPaymentSettingsView.as_view(), name='owner-payment-settings'),
    path('payment-settings/test/', OwnerPaymentSettingsTestView.as_view(), name='owner-payment-settings-test'),
    path('payments/', OwnerPaymentsListView.as_view(), name='owner-payments'),
    path('customers/', OwnerCustomersListView.as_view(), name='owner-customers'),
    path('customers/<int:user_id>/', OwnerCustomerDetailView.as_view(), name='owner-customer-detail'),
    path('requests/', OwnerRequestsListView.as_view(), name='owner-order-requests'),
    path('requests/<int:pk>/decide/', OwnerRequestDecideView.as_view(), name='owner-order-request-decide'),
]

urlpatterns = [
    # Public & Buyer client endpoints
    path('submit/', BulkOrderSubmitView.as_view(), name='bulk-order-submit'),
    path('my-orders/', ClientBulkOrdersListView.as_view(), name='client-bulk-orders-list'),
    path('my-orders/<str:order_number>/', ClientBulkOrderDetailView.as_view(), name='client-bulk-order-detail'),
    path('my-orders/<str:order_number>/pay/', ClientBulkOrderPayView.as_view(), name='client-bulk-order-pay'),
    path('my-orders/<str:order_number>/pay/verify/', ClientBulkOrderPayVerifyView.as_view(), name='client-bulk-order-pay-verify'),
    path('payments/razorpay/webhook/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
    path('my-orders/<str:order_number>/invoice/', ClientInvoiceView.as_view(), name='client-bulk-order-invoice'),
    path('my-orders/<str:order_number>/requests/', ClientOrderRequestView.as_view(), name='client-bulk-order-requests'),
    path('my-orders/<str:order_number>/messages/', ClientBulkOrderMessagePostView.as_view(), name='client-bulk-order-message-post'),
    path('my-orders/<str:order_number>/attachment/', BulkOrderAttachmentDownloadView.as_view(), name='bulk-order-attachment'),
    path('messages/<int:message_id>/attachment/', BulkOrderMessageAttachmentDownloadView.as_view(), name='bulk-order-message-attachment'),
    path('track-checked-product/<int:product_id>/', TrackCheckedProductView.as_view(), name='track-checked-product'),
    path('checked-products/', ClientCheckedProductsListView.as_view(), name='client-checked-products'),

    # Legacy owner aliases (same views). The deployed frontend still calls these during a
    # rollout; the canonical paths are in owner_urlpatterns under /api/v1/owner/.
    path('owner/backup/download/', OwnerConversationBackupDownloadView.as_view(), name='owner-conversation-backup-download-legacy'),
    path('owner/backup/snapshot/', OwnerConversationBackupCreateSnapshotView.as_view(), name='owner-conversation-backup-snapshot-legacy'),
    path('owner/payment-settings/', OwnerPaymentSettingsView.as_view(), name='owner-payment-settings-legacy'),
    path('owner/payment-settings/test/', OwnerPaymentSettingsTestView.as_view(), name='owner-payment-settings-test-legacy'),
    path('owner/payments/', OwnerPaymentsListView.as_view(), name='owner-payments-legacy'),
]
