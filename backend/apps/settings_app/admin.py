from django.contrib import admin
from .models import SiteSettings, HomePageSection


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'tagline', 'phone', 'email', 'updated_at')
    fieldsets = (
        ('Store Identity & Branding', {
            'fields': ('business_name', 'tagline', 'logo_url', 'favicon_url')
        }),
        ('Hero Showcase (Homepage)', {
            'fields': ('hero_badge', 'hero_title', 'hero_subtitle', 'hero_caption')
        }),
        ('Contact & Physical Location', {
            'fields': ('phone', 'whatsapp', 'email', 'address')
        }),
        ('Legal & Taxation', {
            'fields': ('gst_number', 'footer_text')
        }),
        ('CMS & Metadata', {
            'classes': ('collapse',),
            'fields': ('about_data', 'social_links', 'seo_defaults')
        }),
    )

    def has_add_permission(self, request):
        # Enforce singleton pattern: only one settings record can exist
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HomePageSection)
class HomePageSectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'section_type', 'display_order', 'is_active', 'updated_at')
    list_filter = ('is_active', 'section_type')
    search_fields = ('title', 'subtitle')
    filter_horizontal = ('featured_categories', 'featured_products')

