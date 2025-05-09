"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 5.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    "0.0.0.0",
    "127.0.0.1",
    "localhost",
    "tr-back",
    "tr-front",
    "tr-db",
    "nginx-exporter",
    "postgres-exporter",
    "docker-exporter",
]
# ALLOWED_HOSTS = ["*"]

SITE_ID = 1

# Application definition

INSTALLED_APPS = [
    # My apps
    "users",
    "tournaments",
    "games",
    "friends",
    # Third-party apps
    "axes",
    "corsheaders",
    # Default Django apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Django Monitoring
    "django_prometheus",
]


MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "axes.middleware.AxesMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
]


ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB"),
        "USER": os.environ.get("POSTGRES_USER"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
        "HOST": "tr_db",
        "PORT": os.environ.get("POSTGRES_PORT"),
    }
}

AUTH_USER_MODEL = "users.CustomUser"

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# prepend /backend to all urls e.g.
# http://localhost:8000/admin/ -> http://localhost:4242/backend/admin/
# FORCE_SCRIPT_NAME = '/backend'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "/static/"

STATICFILES_DIRS = [
    BASE_DIR / "static",  # Where static files are stored during development
]
# STATIC_ROOT = BASE_DIR / 'static'

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Session settings
SESSION_COOKIE_AGE = 7200  # 2 hours
SESSION_SAVE_EVERY_REQUEST = (
    True  # Automatic session refresh every time the user interacts with the server
)
SESSION_COOKIE_SECURE = True  # Cookie sent only over HTTPS, trug Nginx
SESSION_COOKIE_SAMESITE = "None"  # Required for cross-origin authentication

# Axes settings
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=15)
AXES_RESET_ON_SUCCESS = True
AXES_RESET_COOL_OFF_ON_FAILURE_DURING_LOCKOUT = False
AXES_LOCKOUT_PARAMETERS = ["username"]
AXES_LOCKOUT_CALLABLE = "backend.views.lockout"

AUTHENTICATION_BACKENDS = [
    "axes.backends.AxesStandaloneBackend",  # Django Axes backend
    "django.contrib.auth.backends.ModelBackend",  # Default Django backend
]

CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:4242",
    "http://0.0.0.0:8080",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://tr_front:8443",
    "https://tr_front:8443",
    "https://localhost:8443",
    "http://localhost:8443",
]

CSRF_COOKIE_SECURE = True  # Cookie sent only over HTTPS, trug Nginx
CSRF_COOKIE_HTTPONLY = False  # If True, JS cannot read the cookie
CSRF_COOKIE_SAMESITE = "None"  # Required for cross-origin authentication


CORS_ALLOWED_ORIGINS = [
    "http://0.0.0.0:8080",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://tr_front:8443",
    "https://tr_front:8443",
    "https://localhost:8443",
    "http://localhost:8443",
]

CORS_ALLOW_CREDENTIALS = True  # Required for cross-origin authentication
