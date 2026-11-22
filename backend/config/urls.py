from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """Ultra-fast, zero-overhead health check endpoint for UptimeRobot and Render."""
    db_ok = True
    try:
        connection.ensure_connection()
    except Exception:
        db_ok = False
    return JsonResponse({
        "status": "healthy" if db_ok else "degraded",
        "service": "The Print Planet Enterprise",
        "database": "connected" if db_ok else "error",
    }, status=200 if db_ok else 503)

urlpatterns = [
    path('healthz', health_check, name='health-check'),
    path('healthz/', health_check, name='health-check-slash'),
    path('api/healthz', health_check, name='api-health-check'),
    path('admin/', admin.site.urls),

    # OpenAPI Schema & Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1: each app owns its routes. The shared owner router comes last because its
    # detail routes (e.g. images/<pk>/) would otherwise swallow explicit owner paths.
    path('api/v1/', include('apps.catalog.urls')),
    path('api/v1/', include('apps.enquiries.urls')),
    path('api/v1/', include('apps.settings_app.urls')),
    path('api/v1/', include('apps.authentication.urls')),
    path('api/v1/bulk-orders/', include('apps.bulk_orders.urls')),
    path('api/v1/owner/', include('apps.core.urls')),
]

from django.views.static import serve
from django.urls import re_path
from django.http import HttpResponseForbidden

# Customer uploads: only reachable through the authorised download endpoints.
PRIVATE_MEDIA_PREFIXES = ('enquiries/', 'bulk_orders/', 'bulk_messages/')


def secure_media_serve(request, path, document_root=None, show_indexes=False):
    """Prevents unauthorized public access to customer enquiry attachments."""
    if path.startswith(PRIVATE_MEDIA_PREFIXES):
        return HttpResponseForbidden("Direct access to private customer attachments is prohibited.")
    return serve(request, path, document_root=document_root, show_indexes=show_indexes)

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', secure_media_serve, {'document_root': settings.MEDIA_ROOT}),
]
