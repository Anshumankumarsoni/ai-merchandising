from rest_framework import serializers

from .models import AIAnalysis


class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = (
            "id",
            "product",
            "analysis_type",
            "input_data",
            "output_data",
            "status",
            "error_message",
            "created_at",
            "completed_at",
        )
        read_only_fields = (
            "id",
            "output_data",
            "status",
            "error_message",
            "created_at",
            "completed_at",
        )


class GenerateDescriptionSerializer(serializers.Serializer):
    product_title = serializers.CharField(max_length=500)
    product_id = serializers.UUIDField(required=False, allow_null=True)


class ClassifyProductSerializer(serializers.Serializer):
    product_name = serializers.CharField(max_length=500)
    product_id = serializers.UUIDField(required=False, allow_null=True)


class AnalyzeReviewsSerializer(serializers.Serializer):
    reviews = serializers.ListField(
        child=serializers.CharField(), min_length=1, max_length=100
    )
    product_id = serializers.UUIDField(required=False, allow_null=True)


class AnalyzeListingQualitySerializer(serializers.Serializer):
    title = serializers.CharField(max_length=500)
    description = serializers.CharField()
    product_id = serializers.UUIDField(required=False, allow_null=True)
