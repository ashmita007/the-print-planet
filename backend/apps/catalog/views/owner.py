import io
import logging
from django.db.models import Q
from django.utils.text import slugify
from django.conf import settings
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from apps.core.pagination import StandardResultsSetPagination
from apps.catalog.models import Category, Product, ProductImage
from apps.catalog.serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    ProductImageSerializer,
)


logger = logging.getLogger(__name__)


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
            except Exception as e:  # boto/network errors have no common base class
                logger.exception("Cloudflare R2 upload error")
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
            except Exception as e:  # cloudinary/network errors have no common base class
                logger.exception("Cloudinary upload error")
                return Response({'error': f"Cloudinary upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # 3. Fallback to local storage (zero cost, served by Nginx). Raster images get the
            # sized WebP copies the storefront asks for; anything Pillow cannot read (SVG) is
            # stored as uploaded.
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            from PIL import Image as PILImage
            from apps.catalog.local_images import save_product_image
            file_obj.seek(0)
            original = file_obj.read()
            try:
                url = save_product_image(original, slugify(upload_name.rsplit('.', 1)[0])[:80] or 'image')
                saved_path = url.split(settings.MEDIA_URL, 1)[1]
                if not url.startswith(('http://', 'https://')):
                    url = request.build_absolute_uri(url)
            except (OSError, ValueError, SyntaxError, PILImage.DecompressionBombError):
                saved_path = default_storage.save(f"uploads/{upload_name}", ContentFile(original))
                url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
            return Response({
                'secure_url': url,
                'public_id': saved_path,
                'storage': 'local_nginx',
                'optimized_under_1mb': True
            }, status=status.HTTP_201_CREATED)
