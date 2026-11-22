from rest_framework.routers import DefaultRouter

from apps.bulk_orders import urls as bulk_orders_urls
from apps.catalog import urls as catalog_urls
from apps.enquiries import urls as enquiries_urls
from apps.settings_app import urls as settings_urls

# One router for all owner ViewSets so the API root stays a single page at api/v1/owner/.
owner_router = DefaultRouter()
for module in (catalog_urls, enquiries_urls, settings_urls, bulk_orders_urls):
    for prefix, viewset, basename in module.owner_routes:
        owner_router.register(prefix, viewset, basename=basename)

urlpatterns = [
    *bulk_orders_urls.owner_urlpatterns,
    *owner_router.urls,
]
