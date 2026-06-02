import logging
from datetime import datetime, timezone

from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=5,
    name="celery_tasks.tasks.classification.classify_product_async",
)
def classify_product_async(self, analysis_id: str) -> dict:
    """Background task: runs Gemini product classification."""
    from apps.ai_tools.models import AIAnalysis
    from services.ai.gemini_service import GeminiService

    try:
        analysis = AIAnalysis.objects.get(pk=analysis_id)
        analysis.status = AIAnalysis.Status.PROCESSING
        analysis.save(update_fields=["status"])

        product_name = analysis.input_data["product_name"]
        result = GeminiService().classify_product(product_name)

        analysis.output_data = result
        analysis.status = AIAnalysis.Status.COMPLETED
        analysis.completed_at = datetime.now(timezone.utc)
        analysis.save(update_fields=["output_data", "status", "completed_at"])

        logger.info("Classification completed for analysis %s", analysis_id)
        return {"status": "completed", "analysis_id": analysis_id}

    except AIAnalysis.DoesNotExist:
        logger.error("AIAnalysis %s not found", analysis_id)
        raise

    except Exception as exc:
        logger.exception("Classification failed for %s", analysis_id)
        try:
            analysis = AIAnalysis.objects.get(pk=analysis_id)
            analysis.status = AIAnalysis.Status.FAILED
            analysis.error_message = str(exc)
            analysis.save(update_fields=["status", "error_message"])
        except AIAnalysis.DoesNotExist:
            pass
        raise self.retry(exc=exc)
