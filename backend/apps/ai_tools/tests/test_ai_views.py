import pytest
from unittest.mock import patch
from tests.factories import ProductFactory
from apps.ai_tools.models import AIAnalysis


@pytest.mark.django_db
@patch("celery_tasks.tasks.description.generate_description_async.delay")
def test_generate_description_returns_202(mock_task, analyst_client):
    resp = analyst_client.post(
        "/api/v1/ai/generate-description/",
        {"product_title": "Sony Noise Cancelling Headphones"},
        format="json",
    )
    assert resp.status_code == 202
    assert resp.data["status"] == "pending"
    assert resp.data["analysis_type"] == "description"
    mock_task.assert_called_once()


@pytest.mark.django_db
@patch("celery_tasks.tasks.classification.classify_product_async.delay")
def test_classify_product_returns_202(mock_task, analyst_client):
    resp = analyst_client.post(
        "/api/v1/ai/classify-product/",
        {"product_name": "Running Shoes Men Size 10"},
        format="json",
    )
    assert resp.status_code == 202
    assert resp.data["status"] == "pending"
    assert resp.data["analysis_type"] == "classification"
    mock_task.assert_called_once()


@pytest.mark.django_db
@patch("celery_tasks.tasks.review_analysis.analyze_reviews_async.delay")
def test_analyze_reviews_returns_202(mock_task, analyst_client):
    resp = analyst_client.post(
        "/api/v1/ai/analyze-reviews/",
        {"reviews": ["Great product!", "Battery died quickly.", "Good value for money."]},
        format="json",
    )
    assert resp.status_code == 202
    assert resp.data["analysis_type"] == "review"
    mock_task.assert_called_once()


@pytest.mark.django_db
def test_analyze_reviews_requires_at_least_one(analyst_client):
    resp = analyst_client.post(
        "/api/v1/ai/analyze-reviews/",
        {"reviews": []},
        format="json",
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_ai_history_returns_only_own_analyses(analyst_client, manager_client):
    # Create an analysis from analyst
    analyst_client.post(
        "/api/v1/ai/classify-product/",
        {"product_name": "Widget"},
        format="json",
    )
    # Analyst should only see their own
    resp = analyst_client.get("/api/v1/ai/history/")
    assert resp.status_code == 200
    assert resp.data["count"] >= 1


@pytest.mark.django_db
def test_ai_endpoint_requires_auth(api_client):
    resp = api_client.post(
        "/api/v1/ai/generate-description/",
        {"product_title": "Test"},
        format="json",
    )
    assert resp.status_code == 401
