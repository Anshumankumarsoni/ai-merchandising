from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    ordering = ["-created_at"]

    def get_queryset(self):
        return Review.objects.select_related("product").all()
