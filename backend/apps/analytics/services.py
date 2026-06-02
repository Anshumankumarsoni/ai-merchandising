"""
Analytics service layer.
All aggregation queries live here so views stay thin and logic is testable.
"""

from django.db.models import Avg, Count, Q, Sum

from apps.ai_tools.models import AIAnalysis
from apps.catalog.models import Category, Product


class DashboardService:
    @staticmethod
    def get_summary() -> dict:
        agg = Product.objects.aggregate(
            total=Count("id"),
            low_stock=Count("id", filter=Q(inventory_count__lt=10)),
            avg_price=Avg("price"),
            total_inventory=Sum("inventory_count"),
        )
        return {
            "total_products": agg["total"] or 0,
            "total_categories": Category.objects.count(),
            "low_stock_count": agg["low_stock"] or 0,
            "ai_generated_analyses": AIAnalysis.objects.filter(
                status=AIAnalysis.Status.COMPLETED
            ).count(),
            "total_inventory_value": float(
                (agg["avg_price"] or 0) * (agg["total"] or 0)
            ),
            "average_product_price": float(agg["avg_price"] or 0),
        }


class InventoryService:
    LOW_STOCK_THRESHOLD = 10
    TOP_CATEGORIES = 10

    @staticmethod
    def get_dashboard() -> dict:
        low_stock = list(
            Product.objects.filter(
                inventory_count__lt=InventoryService.LOW_STOCK_THRESHOLD
            )
            .select_related("category", "brand")
            .values("id", "sku", "name", "inventory_count", "category__name")
            .order_by("inventory_count")[:20]
        )

        by_category = list(
            Product.objects.values("category__name")
            .annotate(count=Count("id"), total_inventory=Sum("inventory_count"))
            .order_by("-count")[: InventoryService.TOP_CATEGORIES]
        )

        by_marketplace = list(
            Product.objects.values("marketplace")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return {
            "low_stock_products": low_stock,
            "by_category": by_category,
            "by_marketplace": by_marketplace,
        }


class AIUsageService:
    @staticmethod
    def get_usage_by_type() -> list:
        return list(
            AIAnalysis.objects.values("analysis_type")
            .annotate(
                total=Count("id"),
                completed=Count("id", filter=Q(status=AIAnalysis.Status.COMPLETED)),
                failed=Count("id", filter=Q(status=AIAnalysis.Status.FAILED)),
                pending=Count("id", filter=Q(status=AIAnalysis.Status.PENDING)),
            )
            .order_by("-total")
        )
