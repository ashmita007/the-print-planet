from django.contrib import admin
from .models import BulkOrder, BulkOrderMessage, ConversationBackupArchive


class BulkOrderMessageInline(admin.TabularInline):
    model = BulkOrderMessage
    extra = 1
    readonly_fields = ['created_at']


@admin.register(BulkOrder)
class BulkOrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'organization_name', 'organization_type',
        'contact_person', 'phone', 'status', 'estimated_quantity', 'created_at'
    ]
    list_filter = ['organization_type', 'status', 'created_at']
    search_fields = ['order_number', 'organization_name', 'contact_person', 'email', 'phone']
    inlines = [BulkOrderMessageInline]


@admin.register(ConversationBackupArchive)
class ConversationBackupArchiveAdmin(admin.ModelAdmin):
    list_display = ['archive_code', 'total_orders', 'total_messages', 'created_at']
    readonly_fields = ['archive_code', 'total_orders', 'total_messages', 'backup_data', 'created_at']
