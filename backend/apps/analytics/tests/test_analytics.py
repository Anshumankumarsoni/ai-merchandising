import pytest
from tests.factories import AIAnalysisFactory, CategoryFactory, ProductFactory
from apps.ai_tools.models import AIAnalysis


@pytest.mark.django_db
def test_dashboard_stats(analyst_client):
    CategoryFactory.create_batch(3)
    ProductFactory.create_batch(5)
    resp = analyst_client.get("/api/v1/analytics/dashboard/")
    assert resp.status_code == 200
    assert "total_products" in resp.data
    assert "total_categories" in resp.data
    assert "low_stock_count" in resp.data
    assert "ai_generated_analyses" in resp.data
    assert resp.data["total_products"] >= 5
    assert resp.data["total_categories"] >= 3


@pytest.mark.django_db
def test_inventory_dashboard(analyst_client):
    ProductFactory.create_batch(4)
    resp = analyst_client.get("/api/v1/analytics/inventory/")
    assert resp.status_code == 200
    assert "low_stock_products" in resp.data
    assert "by_category" in resp.data
    assert "by_marketplace" in resp.data


@pytest.mark.django_db
def test_ai_usage_analytics(analyst_client):
    analysis = AIAnalysisFactory(status=AIAnalysis.Status.COMPLETED)
    analysis.output_data = {"result": "ok"}
    analysis.save()
    resp = analyst_client.get("/api/v1/analytics/ai-usage/")
    assert resp.status_code == 200
    assert "by_type" in resp.data


@pytest.mark.django_db
def test_analytics_requires_auth(api_client):
    resp = api_client.get("/api/v1/analytics/dashboard/")
    assert resp.status_code == 401
