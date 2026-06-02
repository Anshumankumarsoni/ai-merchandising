import logging
from datetime import datetime, timezone

from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=5,
    name="celery_tasks.tasks.review_analysis.analyze_reviews_async",
)
def analyze_reviews_async(self, analysis_id: str) -> dict:
    """Background task: runs OpenAI review sentiment analysis."""
    from apps.ai_tools.models import AIAnalysis
    from services.ai.openai_service import OpenAIService

    try:
        analysis = AIAnalysis.objects.get(pk=analysis_id)
        analysis.status = AIAnalysis.Status.PROCESSING
        analysis.save(update_fields=["status"])

        reviews = analysis.input_data["reviews"]
        result = OpenAIService().analyze_reviews(reviews)

        analysis.output_data = result
        analysis.status = AIAnalysis.Status.COMPLETED
        analysis.completed_at = datetime.now(timezone.utc)
        analysis.save(update_fields=["output_data", "status", "completed_at"])

        logger.info("Review analysis completed for analysis %s", analysis_id)
        return {"status": "completed", "analysis_id": analysis_id}

    except AIAnalysis.DoesNotExist:
        logger.error("AIAnalysis %s not found", analysis_id)
        raise

    except Exception as exc:
        logger.exception("Review analysis failed for %s", analysis_id)
        try:
            analysis = AIAnalysis.objects.get(pk=analysis_id)
            analysis.status = AIAnalysis.Status.FAILED
            analysis.error_message = str(exc)
            analysis.save(update_fields=["status", "error_message"])
        except AIAnalysis.DoesNotExist:
            pass
        raise self.retry(exc=exc)
