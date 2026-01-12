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

# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID', '30c861a68ae9f1c57d9bb53e639ff1af')
CLOUDFLARE_BUCKET_NAME = os.getenv('CLOUDFLARE_BUCKET_NAME', 'media-storage-prod')
CLOUDFLARE_ACCESS_KEY_ID = os.getenv('CLOUDFLARE_ACCESS_KEY_ID')
CLOUDFLARE_SECRET_ACCESS_KEY = os.getenv('CLOUDFLARE_SECRET_ACCESS_KEY')
CLOUDFLARE_PUBLIC_DOMAIN = os.getenv('CLOUDFLARE_PUBLIC_DOMAIN', 'pub-5d161570919d4124bfe711376b85b46b.r2.dev')

# Storage configuration for Django 4.2+
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "access_key": CLOUDFLARE_ACCESS_KEY_ID,
            "secret_key": CLOUDFLARE_SECRET_ACCESS_KEY,
            "bucket_name": CLOUDFLARE_BUCKET_NAME,
            "endpoint_url": f'https://{CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com',
            "region_name": "auto",
            "signature_version": "s3v4",
            "file_overwrite": False,
            "default_acl": None,
            "querystring_auth": False,
            "custom_domain": CLOUDFLARE_PUBLIC_DOMAIN,
        },
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = f'https://{CLOUDFLARE_PUBLIC_DOMAIN}/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'