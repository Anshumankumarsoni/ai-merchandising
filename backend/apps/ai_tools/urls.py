from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AIAnalysisHistoryViewSet,
    AnalyzeListingQualityView,
    AnalyzeReviewsView,
    ClassifyProductView,
    GenerateDescriptionView,
)

router = DefaultRouter()
router.register("history", AIAnalysisHistoryViewSet, basename="ai-history")

urlpatterns = [
    path("generate-description/", GenerateDescriptionView.as_view(), name="ai-description"),
    path("classify-product/", ClassifyProductView.as_view(), name="ai-classify"),
    path("analyze-reviews/", AnalyzeReviewsView.as_view(), name="ai-reviews"),
    path("analyze-listing/", AnalyzeListingQualityView.as_view(), name="ai-listing"),
    path("", include(router.urls)),
]
