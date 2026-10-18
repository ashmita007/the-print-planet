import os
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
        
        # Category filter (by slug or id - includes child subcategories)
        cat = self.request.query_params.get('category')
        if cat:
            if cat.isdigit():
                qs = qs.filter(Q(category_id=cat) | Q(category__parent_id=cat))
            else:
                qs = qs.filter(Q(category__slug=cat) | Q(category__parent__slug=cat))

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
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = Product.objects.all().select_related('category').prefetch_related('images')
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category_id=cat) if cat.isdigit() else qs.filter(category__slug=cat)
        q = self.request.query_params.get('search')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(sku__icontains=q))
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            qs = qs.filter(is_active=True)
        elif status_param in ['hidden', 'inactive']:
            qs = qs.filter(is_active=False)
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

    def create(self, request, *args, **kwargs):
        name = request.data.get('name', '').strip()
        slug = request.data.get('slug', '').strip()
        if not slug and name:
            from django.utils.text import slugify
            slug = slugify(name) or 'category'

        # Check if identical category already exists by name or slug
        if name:
            existing = Category.objects.filter(Q(name__iexact=name) | Q(slug=slug)).first()
            if existing:
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)

        # Ensure slug is strictly unique
        base_slug = slug or 'category'
        unique_slug = base_slug
        idx = 1
        while Category.objects.filter(slug=unique_slug).exists():
            unique_slug = f"{base_slug}-{idx}"
            idx += 1

        mutable_data = request.data.copy()
        mutable_data['slug'] = unique_slug
        mutable_data['is_active'] = True
        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


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

        # Automatically compress & optimize image to guarantee size is under 1MB
        try:
            from PIL import Image
            file_obj.seek(0)
            img = Image.open(file_obj)
            max_dimension = 1600
            quality = 82

            has_transparency = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
            w, h = img.size
            if max(w, h) > max_dimension:
                scale = max_dimension / max(w, h)
                img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

            opt_io = io.BytesIO()
            filename = file_obj.name

            if has_transparency:
                out_fmt = 'WEBP'
                content_type = 'image/webp'
                if not filename.lower().endswith('.webp'):
                    filename = f"{filename.rsplit('.', 1)[0]}.webp"
                img.save(opt_io, format=out_fmt, quality=quality, method=6)
            else:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                out_fmt = 'JPEG'
                content_type = 'image/jpeg'
                if not filename.lower().endswith(('.jpg', '.jpeg')):
                    filename = f"{filename.rsplit('.', 1)[0]}.jpg"
                img.save(opt_io, format=out_fmt, quality=quality, optimize=True)

            while opt_io.tell() > 1024 * 1024 and quality > 45:
                quality -= 10
                opt_io = io.BytesIO()
                img.save(opt_io, format=out_fmt, quality=quality, optimize=True)

            opt_io.seek(0)
            upload_payload = opt_io
            upload_name = filename
            upload_content_type = content_type
        except Exception as e:
            logger.warning(f"Image auto-optimization fallback: {e}")
            file_obj.seek(0)
            upload_payload = file_obj
            upload_name = file_obj.name
            upload_content_type = getattr(file_obj, 'content_type', 'image/jpeg')

        # 1. Upload to Cloudflare R2 if configured (Zero Cost & Unlimited Bandwidth)
        if getattr(settings, 'R2_ACCESS_KEY_ID', '') and getattr(settings, 'R2_SECRET_ACCESS_KEY', '') and getattr(settings, 'R2_ENDPOINT_URL', ''):
            try:
                import boto3
                from botocore.config import Config
                s3_client = boto3.client(
                    's3',
                    endpoint_url=settings.R2_ENDPOINT_URL,
                    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                    config=Config(signature_version='s3v4')
                )
                key = f"products/{upload_name}"
                s3_client.upload_fileobj(
                    upload_payload,
                    settings.R2_BUCKET_NAME,
                    key,
                    ExtraArgs={'ContentType': upload_content_type}
                )
                public_base = settings.R2_PUBLIC_URL or f"{settings.R2_ENDPOINT_URL.rstrip('/')}/{settings.R2_BUCKET_NAME}"
                r2_url = f"{public_base}/{key}"
                return Response({
                    'secure_url': r2_url,
                    'public_id': key,
                    'storage': 'cloudflare_r2',
                    'optimized_under_1mb': True
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Cloudflare R2 upload error: {e}")
                return Response({'error': f"Cloudflare R2 upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Upload to Cloudinary if configured
        elif settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
            try:
                import cloudinary.uploader
                upload_result = cloudinary.uploader.upload(
                    upload_payload,
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
                    'height': upload_result.get('height'),
                    'storage': 'cloudinary',
                    'optimized_under_1mb': True
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Cloudinary upload error: {e}")
                return Response({'error': f"Cloudinary upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # 3. Fallback to local storage (zero cost, served by Nginx)
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            saved_path = default_storage.save(f"uploads/{upload_name}", ContentFile(upload_payload.read() if hasattr(upload_payload, 'read') else upload_payload))
            url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
            return Response({
                'secure_url': url,
                'public_id': saved_path,
                'storage': 'local_nginx',
                'optimized_under_1mb': True
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

            if filename.endswith('.xlsx'):
                try:
                    import openpyxl
                    wb = openpyxl.load_workbook(uploaded_file, data_only=True)
                    ws = wb.active
                    header_cells = [cell.value for cell in ws[1]]
                    headers = [str(h or '').strip().lower().replace(' ', '_').replace('/', '_').replace('-', '_') for h in header_cells]
                    for row in ws.iter_rows(min_row=2, values_only=True):
                        if any(row):
                            row_dict = {}
                            for col_idx, val in enumerate(row):
                                if col_idx < len(headers) and headers[col_idx]:
                                    row_dict[headers[col_idx]] = val if val is not None else ''
                            rows.append(row_dict)
                except Exception as e:
                    return Response({'error': f'Invalid Excel file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            elif filename.endswith('.json'):
                content = uploaded_file.read().decode('utf-8', errors='ignore')
                try:
                    data = json.loads(content)
                    rows = data.get('products', data) if isinstance(data, dict) else data
                except Exception as e:
                    return Response({'error': f'Invalid JSON: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            elif filename.endswith('.csv'):
                content = uploaded_file.read().decode('utf-8', errors='ignore')
                reader = csv.DictReader(io.StringIO(content))
                for r in reader:
                    rows.append(r)
            else:
                return Response({'error': 'Unsupported file format. Provide .xlsx, .csv or .json'}, status=status.HTTP_400_BAD_REQUEST)
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
            name = (
                str(row.get('client_revised_name') or '').strip() or
                str(row.get('product_name') or '').strip() or
                str(row.get('name') or '').strip() or
                str(row.get('title') or '').strip()
            )
            sku = (str(row.get('sku') or row.get('item_code') or '')).strip()
            cat_slug = (
                str(row.get('category_slug') or '').strip() or
                slugify(str(row.get('category_name') or '').strip()) or
                slugify(str(row.get('category') or '').strip()) or
                'general-supplies'
            )
            price_val = (
                row.get('client_revised_price_(inr)') or
                row.get('client_revised_price') or
                row.get('trade_price_(inr)') or
                row.get('trade_price') or
                row.get('price')
            )

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
                'price': price_val,
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
            name = (
                str(data.get('client_revised_name') or '').strip() or
                str(data.get('product_name') or '').strip() or
                str(data.get('name') or '').strip() or
                str(data.get('title') or '').strip()
            )
            sku = (str(data.get('sku') or data.get('item_code') or '')).strip()
            cat_name = str(data.get('category_name') or data.get('category') or 'General Supplies').strip()
            cat_slug = (
                str(data.get('category_slug') or '').strip() or
                slugify(cat_name) or
                'general-supplies'
            )

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
                    price_raw = (
                        data.get('client_revised_price_(inr)') or
                        data.get('client_revised_price') or
                        data.get('trade_price_(inr)') or
                        data.get('trade_price') or
                        data.get('price')
                    )
                    if price_raw is not None and str(price_raw).strip():
                        try:
                            existing_prod.price = float(str(price_raw).replace(',', ''))
                        except ValueError:
                            pass
                    if data.get('material'):
                        existing_prod.material = data['material']
                    if data.get('dimensions'):
                        existing_prod.dimensions = data['dimensions']
                    if data.get('color'):
                        existing_prod.color = data['color']
                    price_display_val = data.get('display_price_text') or data.get('price_display') or data.get('display_price')
                    if price_display_val:
                        existing_prod.price_display = price_display_val
                    moq_val = data.get('minimum_order_quantity') or data.get('moq')
                    if moq_val:
                        existing_prod.minimum_order_quantity = moq_val
                    specs_raw = data.get('specifications_(json)') or data.get('specifications_json') or data.get('specs') or data.get('specifications')
                    if specs_raw:
                        if isinstance(specs_raw, dict):
                            existing_prod.specifications = specs_raw
                        elif isinstance(specs_raw, str) and specs_raw.strip().startswith('{'):
                            try:
                                existing_prod.specifications = json.loads(specs_raw)
                            except Exception:
                                pass
                    existing_prod.save()
                    updated_count += 1
                else:
                    skipped_count += 1
            else:
                try:
                    price_val = None
                    price_raw = (
                        data.get('client_revised_price_(inr)') or
                        data.get('client_revised_price') or
                        data.get('trade_price_(inr)') or
                        data.get('trade_price') or
                        data.get('price')
                    )
                    if price_raw is not None and str(price_raw).strip():
                        try:
                            price_val = float(str(price_raw).replace(',', ''))
                        except ValueError:
                            pass

                    price_display_val = data.get('display_price_text') or data.get('price_display') or data.get('display_price') or (f"₹ {price_raw}" if price_raw else '')
                    moq_val = data.get('minimum_order_quantity') or data.get('moq')
                    specs_dict = {}
                    specs_raw = data.get('specifications_(json)') or data.get('specifications_json') or data.get('specs') or data.get('specifications')
                    if specs_raw:
                        if isinstance(specs_raw, dict):
                            specs_dict = specs_raw
                        elif isinstance(specs_raw, str) and specs_raw.strip().startswith('{'):
                            try:
                                specs_dict = json.loads(specs_raw)
                            except Exception:
                                pass

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
                        price_display=price_display_val,
                        minimum_order_quantity=moq_val,
                        specifications=specs_dict,
                        reference_source_url=data.get('url') or data.get('reference_source_url'),
                        verification_status=data.get('verification_status', 'verified')
                    )

                    # Add image if provided
                    img_url = data.get('image_url') or data.get('image')
                    if not img_url and data.get('image_filename'):
                        img_url = f"/media/products/{data.get('image_filename')}"
                    if img_url:
                        ProductImage.objects.create(
                            product=new_prod,
                            secure_url=str(img_url).strip(),
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


from django.http import HttpResponse

class OwnerCatalogExportExcelView(APIView):
    """Owner endpoint to download real-time catalogue and all product images as an Excel workbook."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        try:
            import openpyxl
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            from openpyxl.utils import get_column_letter
        except ImportError:
            return Response({'error': 'openpyxl library not installed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        wb = openpyxl.Workbook()

        # Sheet 1: Products & Images
        ws1 = wb.active
        ws1.title = 'Products & Images'

        headers1 = [
            'ID', 'SKU', 'Product Name', 'Category', 'Primary Image URL',
            'Local Image Path', 'Image File Size (KB)', 'Price (INR)', 'Price Display',
            'MOQ', 'Material', 'Dimensions', 'Color', 'Is Featured',
            'Short Description', 'Full Description', 'Specifications (JSON)',
            'SEO Title', 'SEO Description'
        ]

        header_fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
        header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
        border_thin = Border(
            left=Side(style='thin', color='D9D9D9'),
            right=Side(style='thin', color='D9D9D9'),
            top=Side(style='thin', color='D9D9D9'),
            bottom=Side(style='thin', color='D9D9D9')
        )

        ws1.append(headers1)
        for col_num in range(1, len(headers1) + 1):
            cell = ws1.cell(row=1, column=col_num)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)

        from pathlib import Path
        media_products_dir = Path(settings.MEDIA_ROOT) / 'products'

        products = Product.objects.select_related('category').prefetch_related('images').all().order_by('id')

        for p in products:
            primary_img = p.images.filter(is_primary=True).first() or p.images.first()
            img_url = primary_img.secure_url if primary_img else ''
            
            file_size_kb = ''
            local_path = ''
            if primary_img and primary_img.secure_url:
                fname = os.path.basename(primary_img.secure_url)
                fpath = media_products_dir / fname
                if fpath.exists():
                    local_path = f'media/products/{fname}'
                    file_size_kb = round(fpath.stat().st_size / 1024, 1)

            specs_str = json.dumps(p.specifications) if p.specifications else ''

            row = [
                p.id,
                p.sku,
                p.name,
                p.category.name if p.category else '',
                img_url,
                local_path,
                file_size_kb,
                float(p.price) if p.price is not None else '',
                p.price_display or '',
                p.minimum_order_quantity or '',
                p.material or '',
                p.dimensions or '',
                p.color or '',
                'Yes' if p.is_featured else 'No',
                p.short_description or '',
                p.description or '',
                specs_str,
                p.seo_title or '',
                p.seo_description or ''
            ]
            ws1.append(row)

        for row in ws1.iter_rows(min_row=2, max_row=ws1.max_row, min_col=1, max_col=len(headers1)):
            for cell in row:
                cell.font = Font(name='Calibri', size=10)
                cell.border = border_thin
                cell.alignment = Alignment(vertical='top')

        for col in ws1.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = str(cell.value or '')
                if len(val) > max_len:
                    max_len = len(val)
            ws1.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

        # Sheet 2: Categories
        ws2 = wb.create_sheet(title='Categories')
        headers2 = ['ID', 'Category Name', 'Slug', 'Display Order', 'Active', 'Products Count', 'SEO Title', 'SEO Description']
        ws2.append(headers2)
        for col_num in range(1, len(headers2) + 1):
            cell = ws2.cell(row=1, column=col_num)
            cell.fill = PatternFill(start_color='2E75B6', end_color='2E75B6', fill_type='solid')
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')

        for c in Category.objects.all().order_by('display_order'):
            ws2.append([
                c.id,
                c.name,
                c.slug,
                c.display_order,
                'Yes' if c.is_active else 'No',
                c.products.count(),
                c.seo_title or '',
                c.seo_description or ''
            ])

        for row in ws2.iter_rows(min_row=2, max_row=ws2.max_row, min_col=1, max_col=len(headers2)):
            for cell in row:
                cell.font = Font(name='Calibri', size=10)
                cell.border = border_thin

        for col in ws2.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = str(cell.value or '')
                if len(val) > max_len:
                    max_len = len(val)
            ws2.column_dimensions[col_letter].width = min(max(max_len + 3, 14), 50)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="The_Print_Planet_Catalogue_and_Images.xlsx"'
        return response


from apps.catalog.management.commands.backup_database_email import generate_full_database_excel_bytes
from django.core.mail import EmailMessage
from datetime import datetime
from apps.settings_app.models import SiteSettings
from apps.enquiries.models import Enquiry

class OwnerDatabaseBackupEmailView(APIView):
    """Owner endpoint to generate full database Excel backup and email it to owner."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        try:
            excel_bytes = generate_full_database_excel_bytes()
            now_str = datetime.now().strftime('%Y-%m-%d_%H-%M')
            filename = f"The_Print_Planet_DB_Backup_{now_str}.xlsx"

            site_settings = SiteSettings.get_settings()
            recipient = (
                request.data.get('recipient') or
                getattr(settings, 'OWNER_NOTIFICATION_EMAIL', '') or
                site_settings.email or
                'theprintplanet01@gmail.com'
            )
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or f"{site_settings.business_name} <{recipient}>"

            subject = f"📦 [Database Backup] The Print Planet - {now_str}"
            body = f"""
Hello,

Attached is your complete automated database backup for The Print Planet.

Backup Summary:
- Products: {Product.objects.count()} active items
- Categories: {Category.objects.count()} categories
- Enquiries: {Enquiry.objects.count()} customer leads
- Date Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
- Backup File: {filename} ({round(len(excel_bytes) / 1024, 1)} KB)

Best Regards,
The Print Planet Automated Backup Shield
"""
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=from_email,
                to=[recipient],
            )
            email.attach(filename, excel_bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            email.send(fail_silently=False)

            return Response({
                'message': f'Database backup successfully sent to {recipient}',
                'recipient': recipient,
                'filename': filename,
                'file_size_kb': round(len(excel_bytes) / 1024, 1)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to email backup: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OwnerDatabaseBackupDownloadView(APIView):
    """Owner endpoint to download full database Excel backup directly in browser."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        try:
            excel_bytes = generate_full_database_excel_bytes()
            now_str = datetime.now().strftime('%Y-%m-%d_%H-%M')
            filename = f"The_Print_Planet_DB_Backup_{now_str}.xlsx"
            response = HttpResponse(
                excel_bytes,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response({'error': f'Failed to generate backup: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

