from rest_framework import serializers
from .models import Category, Product, ProductImage


from django.utils.text import slugify

class CategorySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'image', 'parent', 'is_active',
            'display_order'
        ]


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'parent',
            'display_order', 'is_active', 'seo_title', 'seo_description',
            'products_count', 'created_at', 'updated_at'
        ]

    def get_products_count(self, obj):
        counts_cache = self.context.get('category_product_counts')
        if counts_cache is not None:
            return counts_cache.get(obj.id, 0)
        from django.db.models import Q
        return Product.objects.filter(
            Q(category=obj) | Q(category__parent=obj),
            is_active=True
        ).count()

    def create(self, validated_data):
        if not validated_data.get('slug'):
            base_slug = slugify(validated_data.get('name', 'category')) or 'category'
            slug = base_slug
            idx = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{idx}"
                idx += 1
            validated_data['slug'] = slug
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'name' in validated_data and not validated_data.get('slug'):
            validated_data['slug'] = instance.slug
        return super().update(instance, validated_data)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            'id', 'product', 'cloudinary_public_id', 'secure_url',
            'alt_text', 'display_order', 'is_primary', 'created_at', 'updated_at'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySimpleSerializer(read_only=True)
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
        images = list(obj.images.all())
        primary = next((img for img in images if getattr(img, 'is_primary', False)), None)
        if not primary and images:
            primary = images[0]
        if primary:
            return {
                'id': primary.id,
                'secure_url': primary.secure_url,
                'alt_text': primary.alt_text or obj.name
            }
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySimpleSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'category' in mutable_data and 'category_id' not in mutable_data:
            cat_val = mutable_data.get('category')
            if isinstance(cat_val, dict) and 'id' in cat_val:
                mutable_data['category_id'] = cat_val['id']
            elif cat_val is not None:
                mutable_data['category_id'] = cat_val
        return super().to_internal_value(mutable_data)

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
        images = list(obj.images.all())
        primary = next((img for img in images if getattr(img, 'is_primary', False)), None)
        if not primary and images:
            primary = images[0]
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
    images = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'short_description',
            'description', 'specifications', 'material', 'dimensions',
            'color', 'minimum_order_quantity', 'price', 'price_display',
            'currency', 'price_visibility', 'is_featured', 'is_active',
            'display_order', 'seo_title', 'seo_description',
            'reference_source_url', 'verification_status', 'images'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'slug': {'required': False},
        }

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'category_id' in mutable_data and 'category' not in mutable_data:
            mutable_data['category'] = mutable_data['category_id']
        elif 'category' in mutable_data and isinstance(mutable_data['category'], dict):
            mutable_data['category'] = mutable_data['category'].get('id')
        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        images_data = validated_data.pop('images', None)
        if not validated_data.get('slug'):
            base_slug = slugify(validated_data.get('name', 'product')) or 'product'
            slug = base_slug
            idx = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{idx}"
                idx += 1
            validated_data['slug'] = slug
        product = super().create(validated_data)
        if images_data:
            self._save_images(product, images_data)
        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        product = super().update(instance, validated_data)
        if images_data is not None:
            instance.images.all().delete()
            self._save_images(instance, images_data)
        return product

    def _save_images(self, product, images_data):
        has_primary = any(img.get('is_primary') or img.get('isPrimary') for img in images_data)
        for i, img in enumerate(images_data):
            url = img.get('secure_url') or img.get('url')
            if url:
                ProductImage.objects.create(
                    product=product,
                    secure_url=url,
                    cloudinary_public_id=img.get('cloudinary_public_id') or img.get('public_id', ''),
                    is_primary=bool(img.get('is_primary') or img.get('isPrimary')) or (not has_primary and i == 0),
                    display_order=i,
                    alt_text=img.get('alt_text', product.name)
                )

    def to_representation(self, instance):
        return ProductDetailSerializer(instance, context=self.context).data
