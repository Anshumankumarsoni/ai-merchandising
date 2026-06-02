import logging
from datetime import datetime, timezone

from .models import AIAnalysis

logger = logging.getLogger(__name__)


class AIToolsService:
    @staticmethod
    def _create_analysis(
        analysis_type: str, input_data: dict, product_id, user
    ) -> AIAnalysis:
        return AIAnalysis.objects.create(
            analysis_type=analysis_type,
            input_data=input_data,
            product_id=product_id,
            requested_by=user,
            status=AIAnalysis.Status.PENDING,
        )

    @staticmethod
    def _complete_analysis(analysis: AIAnalysis, output_data: dict) -> AIAnalysis:
        analysis.output_data = output_data
        analysis.status = AIAnalysis.Status.COMPLETED
        analysis.completed_at = datetime.now(timezone.utc)
        analysis.save(update_fields=["output_data", "status", "completed_at"])
        return analysis

    @staticmethod
    def _fail_analysis(analysis: AIAnalysis, error: str) -> AIAnalysis:
        analysis.status = AIAnalysis.Status.FAILED
        analysis.error_message = error
        analysis.save(update_fields=["status", "error_message"])
        return analysis

    @classmethod
    def generate_description(cls, product_title: str, product_id, user) -> AIAnalysis:
        from services.ai.openai_service import OpenAIService

        analysis = cls._create_analysis(
            AIAnalysis.AnalysisType.DESCRIPTION,
            {"product_title": product_title},
            product_id,
            user,
        )
        try:
            result = OpenAIService().generate_description(product_title)
            return cls._complete_analysis(analysis, result)
        except Exception as exc:
            logger.exception("Description generation failed")
            return cls._fail_analysis(analysis, str(exc))

    @classmethod
    def classify_product(cls, product_name: str, product_id, user) -> AIAnalysis:
        from services.ai.gemini_service import GeminiService

        analysis = cls._create_analysis(
            AIAnalysis.AnalysisType.CLASSIFICATION,
            {"product_name": product_name},
            product_id,
            user,
        )
        try:
            result = GeminiService().classify_product(product_name)
            return cls._complete_analysis(analysis, result)
        except Exception as exc:
            logger.exception("Product classification failed")
            return cls._fail_analysis(analysis, str(exc))

    @classmethod
    def analyze_reviews(cls, reviews: list, product_id, user) -> AIAnalysis:
        from services.ai.openai_service import OpenAIService

        analysis = cls._create_analysis(
            AIAnalysis.AnalysisType.REVIEW,
            {"reviews": reviews, "review_count": len(reviews)},
            product_id,
            user,
        )
        try:
            result = OpenAIService().analyze_reviews(reviews)
            return cls._complete_analysis(analysis, result)
        except Exception as exc:
            logger.exception("Review analysis failed")
            return cls._fail_analysis(analysis, str(exc))

    @classmethod
    def analyze_listing_quality(
        cls, title: str, description: str, product_id, user
    ) -> AIAnalysis:
        from services.ai.openai_service import OpenAIService

        analysis = cls._create_analysis(
            AIAnalysis.AnalysisType.LISTING_QUALITY,
            {"title": title, "description": description},
            product_id,
            user,
        )
        try:
            result = OpenAIService().analyze_listing_quality(title, description)
            return cls._complete_analysis(analysis, result)
        except Exception as exc:
            logger.exception("Listing quality analysis failed")
            return cls._fail_analysis(analysis, str(exc))
