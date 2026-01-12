import os
from pathlib import Path
import dj_database_url
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-changeme-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
AUTH_USER_MODEL = 'users.User'

CORS_ALLOW_CREDENTIALS = True

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'storages',
    
    'users',
    'posts',
    'votes',
    'comments',
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///' + str(BASE_DIR / 'db.sqlite3'))
DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL)
}

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

REDIS_URL = os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/0')
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000'
).split(',')

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Cloudflare R2 Media Storage Configuration
# R2 credentials from environment
CLOUDFLARE_ACCESS_KEY_ID = os.getenv('CLOUDFLARE_ACCESS_KEY_ID')
CLOUDFLARE_SECRET_ACCESS_KEY = os.getenv('CLOUDFLARE_SECRET_ACCESS_KEY')
CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID', '30c861a68ae9f1c57d9bb53e639ff1af')
CLOUDFLARE_BUCKET_NAME = os.getenv('CLOUDFLARE_BUCKET_NAME', 'media-storage-prod')

# R2 endpoint - this is the correct format
AWS_S3_ENDPOINT_URL = f'https://{CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com'
AWS_ACCESS_KEY_ID = CLOUDFLARE_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY = CLOUDFLARE_SECRET_ACCESS_KEY
AWS_STORAGE_BUCKET_NAME = CLOUDFLARE_BUCKET_NAME

# R2-specific settings
AWS_S3_REGION_NAME = 'auto'  # R2 uses 'auto' for region
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_DEFAULT_ACL = None  # R2 doesn't use ACLs
AWS_S3_FILE_OVERWRITE = False  # Don't overwrite files with same name
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',  # Cache for 1 day
}

# Public URL configuration
# Option 1: Use custom domain (recommended for production)
CLOUDFLARE_PUBLIC_DOMAIN = os.getenv('CLOUDFLARE_PUBLIC_DOMAIN')

if CLOUDFLARE_PUBLIC_DOMAIN:
    # If you set up a custom domain like media.yourdomain.com
    AWS_S3_CUSTOM_DOMAIN = CLOUDFLARE_PUBLIC_DOMAIN
    MEDIA_URL = f'https://{CLOUDFLARE_PUBLIC_DOMAIN}/'
else:
    # Option 2: Use R2.dev subdomain (you need to enable this in R2 dashboard)
    # This requires enabling "Public Development URL" in your R2 bucket settings
    # The URL will be: https://pub-<hash>.r2.dev/
    R2_PUBLIC_URL = os.getenv('R2_PUBLIC_URL')
    
    if R2_PUBLIC_URL:
        # Remove https:// and trailing slash if present
        domain = R2_PUBLIC_URL.replace('https://', '').replace('http://', '').rstrip('/')
        AWS_S3_CUSTOM_DOMAIN = domain
        MEDIA_URL = f'https://{domain}/'
        # Critical: Set querystring auth to False for public buckets
        AWS_QUERYSTRING_AUTH = False
    else:
        # Fallback to direct R2 URL (requires public bucket or signed URLs)
        AWS_S3_CUSTOM_DOMAIN = f'{CLOUDFLARE_BUCKET_NAME}.{CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com'
        MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'
        AWS_QUERYSTRING_AUTH = False

# Use S3Boto3Storage for media files
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'