from django.contrib import admin

from .models import EmailOTP


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'purpose', 'created_at', 'expires_at', 'attempts', 'used_at')
    list_filter = ('purpose',)
    search_fields = ('user__email',)
    readonly_fields = ('code_hash',)
