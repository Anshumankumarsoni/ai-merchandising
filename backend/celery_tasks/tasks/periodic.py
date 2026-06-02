"""
Celery beat periodic tasks.
Add to INSTALLED_APPS: 'django_celery_beat' and run:
    python manage.py migrate django_celery_beat
"""
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task(name="celery_tasks.tasks.periodic.cleanup_failed_analyses")
def cleanup_failed_analyses() -> dict:
    """
    Periodic task: remove AI analyses older than 30 days with FAILED status.
    Runs daily to keep the database clean.
    """
    from datetime import datetime, timedelta, timezone

    from apps.ai_tools.models import AIAnalysis

    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    deleted, _ = AIAnalysis.objects.filter(
        status=AIAnalysis.Status.FAILED,
        created_at__lt=cutoff,
    ).delete()

    logger.info("Cleaned up %d failed AI analyses older than 30 days", deleted)
    return {"deleted": deleted}


@shared_task(name="celery_tasks.tasks.periodic.flag_low_stock_products")
def flag_low_stock_products() -> dict:
    """
    Periodic task: log a summary of low-stock products.
    Runs every 6 hours for monitoring.
    """
    from apps.catalog.models import Product

    low_stock = Product.objects.filter(inventory_count__lt=10).count()
    out_of_stock = Product.objects.filter(inventory_count=0).count()

    logger.warning(
        "Inventory alert — low stock: %d products | out of stock: %d products",
        low_stock,
        out_of_stock,
    )
    return {"low_stock": low_stock, "out_of_stock": out_of_stock}
