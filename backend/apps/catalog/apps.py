from django.apps import AppConfig

class CatalogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.catalog'

    def ready(self):
        try:
            import apps.catalog.signals  # noqa
        except Exception:
            pass
