from rest_framework import serializers
from .models import SiteSettings, HomePageSection
from apps.catalog.serializers import CategorySerializer, ProductListSerializer


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'business_name', 'tagline', 'logo_url', 'favicon_url',
            'email', 'phone', 'whatsapp', 'address', 'gst_number',
            'hero_badge', 'hero_title', 'hero_subtitle', 'hero_caption',
            'about_data',
            'social_links', 'footer_text', 'seo_defaults', 'updated_at'
        ]


class HomePageSectionSerializer(serializers.ModelSerializer):
    featured_categories = CategorySerializer(many=True, read_only=True)
    featured_products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = HomePageSection
        fields = [
            'id', 'section_type', 'title', 'subtitle', 'display_order',
            'is_active', 'config', 'featured_categories', 'featured_products',
            'created_at', 'updated_at'
        ]
