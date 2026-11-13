from rest_framework import serializers
from .models import SiteSettings, HomePageSection
from apps.catalog.serializers import CategorySerializer, ProductListSerializer


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.CharField(max_length=1000, allow_blank=True, allow_null=True, required=False)
    favicon_url = serializers.CharField(max_length=1000, allow_blank=True, allow_null=True, required=False)
    hero_badge = serializers.CharField(max_length=255, allow_blank=True, required=False)
    hero_title = serializers.CharField(max_length=255, allow_blank=True, required=False)
    hero_subtitle = serializers.CharField(max_length=255, allow_blank=True, required=False)
    hero_caption = serializers.CharField(allow_blank=True, required=False)
    about_data = serializers.JSONField(required=False)

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


from .models import GoogleReviewConnection  # noqa: E402
from .google_reviews import api_key_for, is_valid_place_id  # noqa: E402

GOOGLE_REVIEW_HOSTS = ('g.page', 'www.google.com', 'google.com', 'maps.google.com', 'search.google.com',
                       'maps.app.goo.gl', 'goo.gl', 'g.co', 'business.google.com')


def _check_google_url(value: str) -> str:
    from urllib.parse import urlparse
    if not value:
        return value
    parsed = urlparse(value)
    host = (parsed.hostname or '').lower()
    if parsed.scheme != 'https' or not (host in GOOGLE_REVIEW_HOSTS or host.endswith('.google.com')):
        raise serializers.ValidationError('Use the https link Google gives you (g.page, maps.app.goo.gl or google.com).')
    return value


class OwnerGoogleReviewSerializer(serializers.ModelSerializer):
    places_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=255)
    has_api_key = serializers.SerializerMethodField()
    api_key_source = serializers.SerializerMethodField()

    class Meta:
        model = GoogleReviewConnection
        fields = [
            'review_url', 'maps_url', 'place_id', 'places_api_key', 'show_on_site',
            'has_api_key', 'api_key_source',
            'rating', 'review_count', 'reviews', 'last_synced_at', 'last_sync_error', 'updated_at',
        ]
        read_only_fields = ['rating', 'review_count', 'reviews', 'last_synced_at', 'last_sync_error', 'updated_at']

    def get_has_api_key(self, obj):
        return bool(api_key_for(obj))

    def get_api_key_source(self, obj):
        import os
        if os.environ.get('GOOGLE_PLACES_API_KEY'):
            return 'server'
        return 'saved' if obj.places_api_key else ''

    def validate_review_url(self, value):
        return _check_google_url(value.strip())

    def validate_maps_url(self, value):
        return _check_google_url(value.strip())

    def validate_place_id(self, value):
        value = value.strip()
        if value and not is_valid_place_id(value):
            raise serializers.ValidationError('That does not look like a Google Place ID (it usually starts with "ChIJ").')
        return value

    def update(self, instance, validated_data):
        # A blank key in the form means "keep the saved one"; send the literal "CLEAR" to remove it.
        key = validated_data.pop('places_api_key', None)
        if key == 'CLEAR':
            instance.places_api_key = ''
        elif key:
            instance.places_api_key = key.strip()
        if 'place_id' in validated_data and validated_data['place_id'] != instance.place_id:
            instance.rating = None
            instance.review_count = None
            instance.reviews = []
            instance.last_synced_at = None
        return super().update(instance, validated_data)


class PublicGoogleReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoogleReviewConnection
        fields = ['review_url', 'maps_url', 'rating', 'review_count', 'reviews', 'last_synced_at']

    def to_representation(self, obj):
        data = super().to_representation(obj)
        if not obj.show_on_site:
            data.update({'rating': None, 'review_count': None, 'reviews': []})
        # Reviews are shown exactly as Google returns them, unfiltered, so the widget is an honest sample.
        return data
