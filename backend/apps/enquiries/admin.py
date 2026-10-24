from django.contrib import admin
from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'phone', 'email', 'company_name', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'full_name', 'phone', 'email', 'company_name', 'message')
    readonly_fields = ('created_at', 'updated_at')


