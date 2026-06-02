from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("id", "product", "content", "sentiment_score", "created_at")
        read_only_fields = ("id", "sentiment_score", "created_at")
