from django.db.models import Q
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.pagination import StandardResultsSetPagination
from apps.catalog.models import Category, Product
from apps.catalog.serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer


class CategoryListView(generics.ListAPIView):
    """List all active categories with product counts."""
    serializer_class = CategorySerializer
    pagination_class = None

    def get_serializer_context(self):
        context = super().get_serializer_context()
        from django.db.models import Count
        from collections import defaultdict

        counts = defaultdict(int)
        direct = Product.objects.filter(is_active=True).values('category_id', 'category__parent_id').annotate(c=Count('id'))
        for item in direct:
            cat_id = item['category_id']
            parent_id = item['category__parent_id']
            c = item['c']
            if cat_id:
                counts[cat_id] += c
            if parent_id:
                counts[parent_id] += c
        context['category_product_counts'] = counts
        return context

    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by('display_order', 'name')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        context = self.get_serializer_context()
        counts = context.get('category_product_counts', {})

        hide_empty = request.query_params.get('hide_empty', 'false').lower() in ('true', '1')
        ordering = request.query_params.get('ordering', '')

        categories = list(queryset)

        if hide_empty:
            categories = [c for c in categories if counts.get(c.id, 0) > 0]

        if ordering in ('products_count', '-products_count', 'count', '-count'):
            reverse = True if ordering in ('-products_count', 'products_count', 'count') else False
            categories.sort(key=lambda c: counts.get(c.id, 0), reverse=reverse)

        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


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

        # Keyword search (supports multi-word query tokens and matches category name as well)
        q = (self.request.query_params.get('search') or self.request.query_params.get('q') or '').strip()
        if q:
            tokens = [t.strip() for t in q.split() if t.strip()]
            for token in tokens:
                qs = qs.filter(
                    Q(name__icontains=token) |
                    Q(sku__icontains=token) |
                    Q(description__icontains=token) |
                    Q(short_description__icontains=token) |
                    Q(material__icontains=token) |
                    Q(dimensions__icontains=token) |
                    Q(color__icontains=token) |
                    Q(category__name__icontains=token) |
                    Q(category__slug__icontains=token)
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
        ordering = self.request.query_params.get('ordering', 'featured')
        if ordering in ['featured', '-is_featured']:
            qs = qs.order_by('-is_featured', 'display_order', '-id')
        elif ordering in ['price', 'price-asc']:
            qs = qs.order_by('price', 'id')
        elif ordering in ['-price', 'price-desc']:
            qs = qs.order_by('-price', 'id')
        elif ordering in ['name', 'name-asc']:
            qs = qs.order_by('name')
        elif ordering in ['-name', 'name-desc']:
            qs = qs.order_by('-name')
        elif ordering in ['created_at', '-created_at', 'display_order']:
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

        # Tokenized product search
        tokens = [t.strip() for t in query.split() if t.strip()]
        prod_qs = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
        for token in tokens:
            prod_qs = prod_qs.filter(
                Q(name__icontains=token) |
                Q(sku__icontains=token) |
                Q(description__icontains=token) |
                Q(short_description__icontains=token) |
                Q(material__icontains=token) |
                Q(dimensions__icontains=token) |
                Q(color__icontains=token) |
                Q(category__name__icontains=token)
            )
        products = prod_qs[:24]

        cat_qs = Category.objects.filter(is_active=True)
        for token in tokens:
            cat_qs = cat_qs.filter(
                Q(name__icontains=token) | Q(description__icontains=token) | Q(slug__icontains=token)
            )
        categories = cat_qs[:8]

        return Response({
            'query': query,
            'products': ProductListSerializer(products, many=True).data,
            'categories': CategorySerializer(categories, many=True).data,
        })
