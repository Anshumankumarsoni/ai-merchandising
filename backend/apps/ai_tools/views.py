from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import AIAnalysis
from .serializers import (
    AIAnalysisSerializer,
    AnalyzeListingQualitySerializer,
    AnalyzeReviewsSerializer,
    ClassifyProductSerializer,
    GenerateDescriptionSerializer,
)


def _create_pending(analysis_type, input_data, product_id, user) -> AIAnalysis:
    return AIAnalysis.objects.create(
        analysis_type=analysis_type,
        input_data=input_data,
        product_id=product_id,
        requested_by=user,
        status=AIAnalysis.Status.PENDING,
    )


class GenerateDescriptionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=GenerateDescriptionSerializer, responses={202: AIAnalysisSerializer}, tags=["AI Tools"])
    def post(self, request):
        from celery_tasks.tasks.description import generate_description_async

        s = GenerateDescriptionSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        analysis = _create_pending(
            AIAnalysis.AnalysisType.DESCRIPTION,
            {"product_title": s.validated_data["product_title"]},
            s.validated_data.get("product_id"),
            request.user,
        )
        generate_description_async.delay(str(analysis.id))
        return Response(AIAnalysisSerializer(analysis).data, status=status.HTTP_202_ACCEPTED)


class ClassifyProductView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=ClassifyProductSerializer, responses={202: AIAnalysisSerializer}, tags=["AI Tools"])
    def post(self, request):
        from celery_tasks.tasks.classification import classify_product_async

        s = ClassifyProductSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        analysis = _create_pending(
            AIAnalysis.AnalysisType.CLASSIFICATION,
            {"product_name": s.validated_data["product_name"]},
            s.validated_data.get("product_id"),
            request.user,
        )
        classify_product_async.delay(str(analysis.id))
        return Response(AIAnalysisSerializer(analysis).data, status=status.HTTP_202_ACCEPTED)


class AnalyzeReviewsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=AnalyzeReviewsSerializer, responses={202: AIAnalysisSerializer}, tags=["AI Tools"])
    def post(self, request):
        from celery_tasks.tasks.review_analysis import analyze_reviews_async

        s = AnalyzeReviewsSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        analysis = _create_pending(
            AIAnalysis.AnalysisType.REVIEW,
            {"reviews": s.validated_data["reviews"]},
            s.validated_data.get("product_id"),
            request.user,
        )
        analyze_reviews_async.delay(str(analysis.id))
        return Response(AIAnalysisSerializer(analysis).data, status=status.HTTP_202_ACCEPTED)


class AnalyzeListingQualityView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=AnalyzeListingQualitySerializer, responses={202: AIAnalysisSerializer}, tags=["AI Tools"])
    def post(self, request):
        # Listing quality runs synchronously (fast enough, no Celery task needed)
        from apps.ai_tools.services import AIToolsService

        s = AnalyzeListingQualitySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        analysis = AIToolsService.analyze_listing_quality(
            s.validated_data["title"],
            s.validated_data["description"],
            s.validated_data.get("product_id"),
            request.user,
        )
        return Response(AIAnalysisSerializer(analysis).data)


class AIAnalysisHistoryViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AIAnalysisSerializer
    ordering = ["-created_at"]

    def get_queryset(self):
        return AIAnalysis.objects.filter(requested_by=self.request.user).order_by("-created_at")
