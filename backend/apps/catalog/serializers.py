from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'parent',
            'display_order', 'is_active', 'seo_title', 'seo_description',
            'products_count', 'created_at', 'updated_at'
        ]

    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            'id', 'product', 'cloudinary_public_id', 'secure_url',
            'alt_text', 'display_order', 'is_primary', 'created_at', 'updated_at'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'category_id',
            'short_description', 'material', 'dimensions', 'color',
            'minimum_order_quantity', 'price', 'price_display', 'currency',
            'price_visibility', 'is_featured', 'is_active', 'display_order',
            'primary_image', 'verification_status', 'created_at', 'updated_at'
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            return {
                'id': primary.id,
                'secure_url': primary.secure_url,
                'alt_text': primary.alt_text or obj.name
            }
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'category_id',
            'short_description', 'description', 'specifications',
            'material', 'dimensions', 'color', 'minimum_order_quantity',
            'price', 'price_display', 'currency', 'price_visibility',
            'is_featured', 'is_active', 'display_order', 'seo_title',
            'seo_description', 'reference_source_url', 'source_verified_at',
            'verification_status', 'primary_image', 'images', 'related_products',
            'created_at', 'updated_at'
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            return {
                'id': primary.id,
                'secure_url': primary.secure_url,
                'alt_text': primary.alt_text or obj.name
            }
        return None

    def get_related_products(self, obj):
        related = Product.objects.filter(
            category=obj.category, is_active=True
        ).exclude(id=obj.id)[:4]
        return ProductListSerializer(related, many=True).data


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'short_description',
            'description', 'specifications', 'material', 'dimensions',
            'color', 'minimum_order_quantity', 'price', 'price_display',
            'currency', 'price_visibility', 'is_featured', 'is_active',
            'display_order', 'seo_title', 'seo_description',
            'reference_source_url', 'verification_status'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'slug': {'required': False},
        }
