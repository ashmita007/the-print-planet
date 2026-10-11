import io
import csv
import json
import logging
from django.db.models import Q
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework.pagination import PageNumberPagination
from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    ProductImageSerializer
)

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100


# ==========================================
# PUBLIC CATALOG VIEWS
# ==========================================

class CategoryListView(generics.ListAPIView):
    """List all active categories with product counts."""
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by('display_order', 'name')


class CategoryDetailView(generics.RetrieveAPIView):
    """Get category details by slug."""
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


class ProductListView(generics.ListAPIView):
    """List products with filtering, search, and pagination."""
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
        
        # Category filter (by slug or id)
        cat = self.request.query_params.get('category')
        if cat:
            if cat.isdigit():
                qs = qs.filter(category_id=cat)
            else:
                qs = qs.filter(category__slug=cat)

        # Keyword search
        q = self.request.query_params.get('search') or self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(name__icontains=q) |
                Q(sku__icontains=q) |
                Q(description__icontains=q) |
                Q(material__icontains=q) |
                Q(dimensions__icontains=q)
            )

        # Attribute filters
        material = self.request.query_params.get('material')
        if material:
            qs = qs.filter(material__icontains=material)

        color = self.request.query_params.get('color')
        if color:
            qs = qs.filter(color__icontains=color)

        is_featured = self.request.query_params.get('featured')
        if is_featured in ('true', '1'):
            qs = qs.filter(is_featured=True)

        # Ordering
        ordering = self.request.query_params.get('ordering', 'display_order')
        if ordering in ['price', '-price', 'name', '-name', 'created_at', '-created_at', 'display_order']:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('display_order', '-id')

        return qs


class ProductDetailView(generics.RetrieveAPIView):
    """Get single product details by slug."""
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')


class FeaturedProductsView(generics.ListAPIView):
    """Get featured products for homepage and highlights."""
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(is_active=True, is_featured=True).select_related('category').prefetch_related('images')[:24]


class GlobalSearchView(APIView):
    """Unified search endpoint for products and categories."""
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'products': [], 'categories': []})

        products = Product.objects.filter(
            Q(name__icontains=query) | Q(sku__icontains=query) | Q(description__icontains=query),
            is_active=True
        )[:15]
        categories = Category.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query),
            is_active=True
        )[:5]

        return Response({
            'query': query,
            'products': ProductListSerializer(products, many=True).data,
            'categories': CategorySerializer(categories, many=True).data,
        })


# ==========================================
# OWNER MANAGEMENT VIEWS
# ==========================================

class OwnerProductViewSet(viewsets.ModelViewSet):
    """Owner product management ViewSet (CRUD, activate, deactivate)."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        qs = Product.objects.all().select_related('category').prefetch_related('images')
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category_id=cat) if cat.isdigit() else qs.filter(category__slug=cat)
        q = self.request.query_params.get('search')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(sku__icontains=q))
        return qs.order_by('-id')

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return ProductDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductListSerializer


class OwnerCategoryViewSet(viewsets.ModelViewSet):
    """Owner category management ViewSet."""
    queryset = Category.objects.all().order_by('display_order', 'id')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    pagination_class = None


class OwnerProductImageViewSet(viewsets.ModelViewSet):
    """Owner product image management ViewSet."""
    queryset = ProductImage.objects.all().order_by('display_order', 'id')
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs

    def perform_create(self, serializer):
        image = serializer.save()
        if image.is_primary:
            ProductImage.objects.filter(product=image.product).exclude(id=image.id).update(is_primary=False)

    def perform_update(self, serializer):
        image = serializer.save()
        if image.is_primary:
            ProductImage.objects.filter(product=image.product).exclude(id=image.id).update(is_primary=False)


class OwnerImageUploadView(APIView):
    """Direct authenticated Cloudinary image uploader."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file') or request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 10MB)
        if file_obj.size > 10 * 1024 * 1024:
            return Response({'error': 'File size exceeds 10MB limit'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate MIME type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
        if file_obj.content_type not in allowed_types:
            return Response({'error': f'Unsupported image type: {file_obj.content_type}'}, status=status.HTTP_400_BAD_REQUEST)

        # Upload to Cloudinary if configured
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
            try:
                import cloudinary.uploader
                upload_result = cloudinary.uploader.upload(
                    file_obj,
                    folder="the_print_planet/products",
                    resource_type="image",
                    use_filename=True,
                    unique_filename=True
                )
                return Response({
                    'secure_url': upload_result.get('secure_url'),
                    'public_id': upload_result.get('public_id'),
                    'format': upload_result.get('format'),
                    'width': upload_result.get('width'),
                    'height': upload_result.get('height')
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Cloudinary upload error: {e}")
                return Response({'error': f"Cloudinary upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Fallback to local storage
            from django.core.files.storage import default_storage
            saved_path = default_storage.save(f"uploads/{file_obj.name}", file_obj)
            url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
            return Response({
                'secure_url': url,
                'public_id': saved_path,
                'warning': 'Cloudinary credentials not configured; stored locally on server.'
            }, status=status.HTTP_201_CREATED)


# ==========================================
# BULK CSV/JSON IMPORT VIEWS
# ==========================================

class OwnerBulkImportValidateView(APIView):
    """Validate CSV or JSON payload before importing."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        rows = []
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            filename = uploaded_file.name.lower()
            content = uploaded_file.read().decode('utf-8', errors='ignore')

            if filename.endswith('.json'):
                try:
                    data = json.loads(content)
                    rows = data.get('products', data) if isinstance(data, dict) else data
                except Exception as e:
                    return Response({'error': f'Invalid JSON: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            elif filename.endswith('.csv'):
                reader = csv.DictReader(io.StringIO(content))
                for r in reader:
                    rows.append(r)
            else:
                return Response({'error': 'Unsupported file format. Provide .csv or .json'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'products' in request.data:
            rows = request.data['products']
        else:
            return Response({'error': 'No file or products data provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate rows
        valid_rows = []
        errors = []
        existing_skus = set(Product.objects.values_list('sku', flat=True))
        existing_slugs = set(Product.objects.values_list('slug', flat=True))

        for idx, row in enumerate(rows):
            name = (row.get('name') or '').strip()
            sku = (row.get('sku') or '').strip()
            cat_slug = (row.get('category_slug') or row.get('category') or '').strip()

            if not name:
                errors.append({'row': idx + 1, 'sku': sku, 'error': 'Product name is required'})
                continue

            status_flag = 'new'
            if sku in existing_skus:
                status_flag = 'existing_sku'
            elif (row.get('slug') or '') in existing_slugs:
                status_flag = 'existing_slug'

            valid_rows.append({
                'row_index': idx + 1,
                'name': name,
                'sku': sku or f"GEN-{idx+1:04d}",
                'category_slug': cat_slug,
                'price': row.get('price'),
                'material': row.get('material'),
                'dimensions': row.get('dimensions'),
                'status': status_flag,
                'raw_data': row
            })

        return Response({
            'total_rows': len(rows),
            'valid_count': len(valid_rows),
            'new_count': sum(1 for r in valid_rows if r['status'] == 'new'),
            'existing_count': sum(1 for r in valid_rows if r['status'].startswith('existing')),
            'error_count': len(errors),
            'errors': errors,
            'preview': valid_rows[:50]
        })


class OwnerBulkImportExecuteView(APIView):
    """Execute validated bulk import with update or skip strategy."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        rows = request.data.get('rows', [])
        strategy = request.data.get('strategy', 'skip')  # 'skip' or 'update'

        if not rows:
            return Response({'error': 'No rows to import'}, status=status.HTTP_400_BAD_REQUEST)

        imported_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []

        for item in rows:
            data = item.get('raw_data', item)
            name = (data.get('name') or '').strip()
            sku = (data.get('sku') or '').strip()
            cat_name = (data.get('category_name') or 'General Supplies').strip()
            cat_slug = (data.get('category_slug') or 'general-supplies').strip()

            if not name:
                continue

            # Ensure category exists
            category, _ = Category.objects.get_or_create(
                slug=cat_slug,
                defaults={'name': cat_name, 'display_order': 10}
            )

            existing_prod = Product.objects.filter(Q(sku=sku) | Q(slug=data.get('slug', ''))).first() if sku else None

            if existing_prod:
                if strategy == 'update':
                    existing_prod.name = name
                    existing_prod.category = category
                    if data.get('short_description'):
                        existing_prod.short_description = data['short_description']
                    if data.get('description'):
                        existing_prod.description = data['description']
                    if data.get('price') is not None and str(data.get('price')).strip():
                        try:
                            existing_prod.price = float(str(data['price']).replace(',', ''))
                        except ValueError:
                            pass
                    if data.get('material'):
                        existing_prod.material = data['material']
                    if data.get('dimensions'):
                        existing_prod.dimensions = data['dimensions']
                    if data.get('color'):
                        existing_prod.color = data['color']
                    if data.get('specs'):
                        existing_prod.specifications = data['specs'] if isinstance(data['specs'], dict) else json.loads(data['specs'])
                    existing_prod.save()
                    updated_count += 1
                else:
                    skipped_count += 1
            else:
                try:
                    price_val = None
                    if data.get('price') is not None and str(data.get('price')).strip():
                        try:
                            price_val = float(str(data['price']).replace(',', ''))
                        except ValueError:
                            pass

                    specs_dict = {}
                    if data.get('specs'):
                        specs_dict = data['specs'] if isinstance(data['specs'], dict) else json.loads(data['specs'])
                    elif data.get('specifications_json'):
                        specs_dict = json.loads(data['specifications_json'])

                    new_prod = Product.objects.create(
                        name=name,
                        sku=sku or f"SKU-{Product.objects.count()+1:04d}",
                        category=category,
                        short_description=data.get('short_description', ''),
                        description=data.get('description', ''),
                        material=data.get('material'),
                        dimensions=data.get('dimensions'),
                        color=data.get('color'),
                        price=price_val,
                        price_display=data.get('price_display'),
                        specifications=specs_dict,
                        reference_source_url=data.get('url') or data.get('reference_source_url'),
                        verification_status=data.get('verification_status', 'verified')
                    )

                    # Add image if provided
                    img_url = data.get('image_url')
                    if img_url:
                        ProductImage.objects.create(
                            product=new_prod,
                            secure_url=img_url,
                            alt_text=name,
                            is_primary=True
                        )
                    imported_count += 1
                except Exception as e:
                    errors.append({'name': name, 'sku': sku, 'error': str(e)})

        return Response({
            'message': 'Bulk import completed',
            'imported_count': imported_count,
            'updated_count': updated_count,
            'skipped_count': skipped_count,
            'errors': errors
        }, status=status.HTTP_200_OK)
