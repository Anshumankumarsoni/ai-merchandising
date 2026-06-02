import logging

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, Http404):
        return Response({"detail": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, PermissionDenied):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if isinstance(exc, ValidationError):
        return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)

    if response is not None:
        return Response(
            {"detail": response.data, "status_code": response.status_code},
            status=response.status_code,
        )

    logger.exception("Unhandled exception in view", exc_info=exc)
    return Response(
        {"detail": "An unexpected error occurred. Please try again later."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
