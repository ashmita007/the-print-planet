import os
import sys
import socket
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Test environment detection
TESTING = 'test' in sys.argv or 'pytest' in sys.modules

# Load environment variables from .env if present
load_dotenv(BASE_DIR.parent / '.env')
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-the-print-planet-production-ready-key-2026')

DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'drf_spectacular',

    # Local apps
    'apps.catalog',
    'apps.enquiries',
    'apps.settings_app',
    'apps.authentication',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Render / Reverse Proxy SSL Header
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

def _is_postgres_ready(host, port):
    if not host:
        return False
    try:
        with socket.create_connection((host, int(port)), timeout=0.5):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

# Database configuration: Render DATABASE_URL takes priority, then local Postgres, then SQLite
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=(not DEBUG),
        )
    }
else:
    DB_ENGINE = os.environ.get('DB_ENGINE', 'django.db.backends.postgresql')
    DB_NAME = os.environ.get('POSTGRES_DB', os.environ.get('DB_NAME', 'the_print_planet'))
    DB_USER = os.environ.get('POSTGRES_USER', os.environ.get('DB_USER', 'postgres'))
    DB_PASSWORD = os.environ.get('POSTGRES_PASSWORD', os.environ.get('DB_PASSWORD', 'postgres'))
    DB_HOST = os.environ.get('POSTGRES_HOST', os.environ.get('DB_HOST', 'localhost'))
    DB_PORT = os.environ.get('POSTGRES_PORT', os.environ.get('DB_PORT', '5432'))

    explicit_sqlite = os.environ.get('USE_SQLITE', '').lower() in ('true', '1')
    postgres_available = False if explicit_sqlite else _is_postgres_ready(DB_HOST, DB_PORT)

    if explicit_sqlite or not postgres_available:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': DB_NAME,
                'USER': DB_USER,
                'PASSWORD': DB_PASSWORD,
                'HOST': DB_HOST,
                'PORT': DB_PORT,
                'CONN_MAX_AGE': 60,
            }
        }

# High-Performance SQLite WAL Configuration for Enterprise Concurrency & Speed
from django.db.backends.signals import connection_created
from django.dispatch import receiver

@receiver(connection_created)
def configure_sqlite_pragmas(sender, connection, **kwargs):
    """
    Optimizes SQLite for high concurrency, zero locks, and maximum read speed:
    - WAL (Write-Ahead Logging): non-blocking concurrent reads and writes
    - synchronous=NORMAL: reduces disk fsync overhead safely
    - cache_size=-64000: 64MB RAM cache for instant catalog & query reads
    - mmap_size=268435456: 256MB memory mapping
    - busy_timeout=10000: eliminates 'database is locked' errors under peak traffic
    - temp_store=MEMORY: keeps temporary tables and sorting in memory for high speed
    """
    if connection.vendor == 'sqlite':
        cursor = connection.cursor()
        cursor.execute('PRAGMA journal_mode=WAL;')
        cursor.execute('PRAGMA synchronous=NORMAL;')
        cursor.execute('PRAGMA cache_size=-64000;')
        cursor.execute('PRAGMA mmap_size=268435456;')
        cursor.execute('PRAGMA busy_timeout=10000;')
        cursor.execute('PRAGMA temp_store=MEMORY;')

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 24,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}

# OpenAPI Docs (drf-spectacular)
SPECTACULAR_SETTINGS = {
    'TITLE': 'The Print Planet B2B API',
    'DESCRIPTION': 'Public product catalogue, RFQ enquiry management, and owner administration API.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# WhiteNoise static file storage in production
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage" if not DEBUG else "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# CORS & CSRF Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:8080",
    "https://*.onrender.com",
    "https://theprintplanet.co.in",
    "https://*.theprintplanet.co.in",
    "http://theprintplanet.co.in",
    "http://*.theprintplanet.co.in",
    "https://theprintplanet.in",
    "https://*.theprintplanet.in",
]

csrf_env = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if csrf_env:
    CSRF_TRUSTED_ORIGINS.extend([o.strip() for o in csrf_env.split(',') if o.strip()])

cors_env = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if cors_env:
    CORS_ALLOWED_ORIGINS.extend([o.strip() for o in cors_env.split(',') if o.strip()])

# Cloudinary Configuration for Production Media Assets (Sanitized & Resilient)
raw_c_url = os.environ.get('CLOUDINARY_URL', '').strip().strip('"\'')
if raw_c_url.startswith('CLOUDINARY_URL='):
    raw_c_url = raw_c_url.split('CLOUDINARY_URL=', 1)[1].strip().strip('"\'')

if raw_c_url and raw_c_url.startswith('cloudinary://') and '@' in raw_c_url:
    os.environ['CLOUDINARY_URL'] = raw_c_url
    CLOUDINARY_URL = raw_c_url
    try:
        import cloudinary
        import urllib.parse
        cloudinary.config(cloudinary_url=raw_c_url)
        parsed = urllib.parse.urlparse(raw_c_url)
        CLOUDINARY_CLOUD_NAME = parsed.hostname or ''
        CLOUDINARY_API_KEY = parsed.username or ''
        CLOUDINARY_API_SECRET = parsed.password or ''
    except Exception:
        CLOUDINARY_URL = ''
        CLOUDINARY_CLOUD_NAME = ''
        CLOUDINARY_API_KEY = ''
        CLOUDINARY_API_SECRET = ''
else:
    # Clean from os.environ so cloudinary module import does not raise ValueError on empty or malformed values
    if 'CLOUDINARY_URL' in os.environ:
        del os.environ['CLOUDINARY_URL']
    CLOUDINARY_URL = ''
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '').strip()
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '').strip()
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '').strip()
    if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
        try:
            import cloudinary
            cloudinary.config(
                cloud_name=CLOUDINARY_CLOUD_NAME,
                api_key=CLOUDINARY_API_KEY,
                api_secret=CLOUDINARY_API_SECRET,
                secure=True
            )
        except Exception:
            pass

# Cloudflare R2 Storage Configuration (10GB Lifetime Free, Zero Egress Cost)
R2_ACCESS_KEY_ID = os.environ.get('R2_ACCESS_KEY_ID', os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID', ''))
R2_SECRET_ACCESS_KEY = os.environ.get('R2_SECRET_ACCESS_KEY', os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY', ''))
R2_BUCKET_NAME = os.environ.get('R2_BUCKET_NAME', os.environ.get('CLOUDFLARE_R2_BUCKET_NAME', 'the-print-planet'))
R2_ENDPOINT_URL = os.environ.get('R2_ENDPOINT_URL', os.environ.get('CLOUDFLARE_R2_ENDPOINT_URL', ''))
R2_PUBLIC_URL = os.environ.get('R2_PUBLIC_URL', os.environ.get('CLOUDFLARE_R2_PUBLIC_URL', '')).rstrip('/')

# Email Notification System for Customer Inquiries & RFQs
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '').strip()
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '').strip()

EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() in ('true', '1')
EMAIL_TIMEOUT = 5

if TESTING:
    EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
elif EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'apps.enquiries.email_backend.CertifiEmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', f'The Print Planet <{EMAIL_HOST_USER or "theprintplanet01@gmail.com"}>')
OWNER_NOTIFICATION_EMAIL = os.environ.get('OWNER_NOTIFICATION_EMAIL', 'theprintplanet01@gmail.com')

# HTTPS REST Email APIs (Port 443 - Bypasses Render Free Port Restrictions)
BREVO_API_KEY = os.environ.get('BREVO_API_KEY', '').strip()
BREVO_SENDER_EMAIL = os.environ.get('BREVO_SENDER_EMAIL', 'theprintplanet01@gmail.com').strip()
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
RESEND_FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', 'The Print Planet <onboarding@resend.dev>').strip()
EMAIL_WEBHOOK_URL = os.environ.get('EMAIL_WEBHOOK_URL', '').strip()

# Security Headers & Cookie Policies
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_HTTPONLY = True
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True



