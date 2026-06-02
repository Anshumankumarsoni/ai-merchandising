import pytest
from tests.factories import (
    AIAnalysisFactory,
    CategoryFactory,
    LowStockProductFactory,
    ProductFactory,
)
from apps.ai_tools.models import AIAnalysis
from apps.analytics.services import AIUsageService, DashboardService, InventoryService


@pytest.mark.django_db
class TestDashboardService:
    def test_get_summary_counts(self):
        CategoryFactory.create_batch(3)
        ProductFactory.create_batch(5)
        result = DashboardService.get_summary()

        assert result["total_products"] >= 5
        assert result["total_categories"] >= 3
        assert "low_stock_count" in result
        assert "ai_generated_analyses" in result
        assert "average_product_price" in result
        assert "total_inventory_value" in result

    def test_low_stock_counted(self):
        LowStockProductFactory.create_batch(3)
        result = DashboardService.get_summary()
        assert result["low_stock_count"] >= 3

    def test_ai_analyses_counted(self):
        a = AIAnalysisFactory(status=AIAnalysis.Status.COMPLETED)
        a.output_data = {"ok": True}
        a.save()
        result = DashboardService.get_summary()
        assert result["ai_generated_analyses"] >= 1

    def test_empty_database(self):
        result = DashboardService.get_summary()
        assert result["total_products"] == 0
        assert result["average_product_price"] == 0.0


@pytest.mark.django_db
class TestInventoryService:
    def test_low_stock_products(self):
        LowStockProductFactory.create_batch(4)
        ProductFactory(inventory_count=100)  # not low stock
        result = InventoryService.get_dashboard()

        assert "low_stock_products" in result
        assert "by_category" in result
        assert "by_marketplace" in result
        # All returned low stock items must have count < 10
        for item in result["low_stock_products"]:
            assert item["inventory_count"] < 10

    def test_by_category_structure(self):
        ProductFactory.create_batch(3)
        result = InventoryService.get_dashboard()
        for entry in result["by_category"]:
            assert "count" in entry
            assert "total_inventory" in entry

    def test_by_marketplace_structure(self):
        ProductFactory(marketplace="amazon")
        ProductFactory(marketplace="ebay")
        result = InventoryService.get_dashboard()
        marketplaces = [e["marketplace"] for e in result["by_marketplace"]]
        assert "amazon" in marketplaces or "ebay" in marketplaces


@pytest.mark.django_db
class TestAIUsageService:
    def test_usage_by_type(self):
        AIAnalysisFactory(
            analysis_type=AIAnalysis.AnalysisType.DESCRIPTION,
            status=AIAnalysis.Status.COMPLETED,
        )
        AIAnalysisFactory(
            analysis_type=AIAnalysis.AnalysisType.CLASSIFICATION,
            status=AIAnalysis.Status.FAILED,
        )
        result = AIUsageService.get_usage_by_type()
        assert len(result) >= 1
        for entry in result:
            assert "analysis_type" in entry
            assert "total" in entry
            assert "completed" in entry
            assert "failed" in entry

    def test_empty_returns_list(self):
        result = AIUsageService.get_usage_by_type()
        assert isinstance(result, list)
