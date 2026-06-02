from .base import *  # noqa: F401, F403

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True

try:
    import django_extensions  # noqa: F401
    INSTALLED_APPS += ["django_extensions"]  # noqa: F405
except ImportError:
    pass

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
