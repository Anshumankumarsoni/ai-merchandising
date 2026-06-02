import json
from unittest.mock import MagicMock, patch

import pytest
from apps.ai_tools.models import AIAnalysis
from tests.factories import AIAnalysisFactory


@pytest.mark.django_db
@patch("services.ai.openai_service.OpenAI")
def test_generate_description_task_completes(mock_openai, settings):
    settings.OPENAI_API_KEY = "test-key"
    settings.OPENAI_MODEL = "gpt-4o-mini"
    settings.AI_REQUEST_TIMEOUT = 30
    settings.AI_MAX_RETRIES = 1

    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(
        {
            "seo_title": "Test SEO Title",
            "description": "A great product",
            "features": ["Feature 1", "Feature 2"],
            "keywords": ["test", "product"],
        }
    )
    mock_usage = MagicMock()
    mock_usage.total_tokens = 50
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    mock_response.usage = mock_usage
    mock_openai.return_value.chat.completions.create.return_value = mock_response

    analysis = AIAnalysisFactory(
        analysis_type=AIAnalysis.AnalysisType.DESCRIPTION,
        input_data={"product_title": "Test Product"},
        status=AIAnalysis.Status.PENDING,
    )

    from celery_tasks.tasks.description import generate_description_async

    generate_description_async(str(analysis.id))

    analysis.refresh_from_db()
    assert analysis.status == AIAnalysis.Status.COMPLETED
    assert analysis.output_data is not None
    assert analysis.output_data["seo_title"] == "Test SEO Title"


@pytest.mark.django_db
@patch("services.ai.gemini_service.genai")
def test_classify_product_task_completes(mock_genai, settings):
    settings.GEMINI_API_KEY = "test-key"
    settings.GEMINI_MODEL = "gemini-1.5-flash"
    settings.AI_MAX_RETRIES = 1

    mock_response = MagicMock()
    mock_response.text = json.dumps(
        {
            "category": "Electronics",
            "subcategory": "Audio",
            "confidence": 0.95,
            "reasoning": "This is headphones.",
        }
    )
    mock_genai.GenerativeModel.return_value.generate_content.return_value = (
        mock_response
    )

    analysis = AIAnalysisFactory(
        analysis_type=AIAnalysis.AnalysisType.CLASSIFICATION,
        input_data={"product_name": "Sony Headphones"},
        status=AIAnalysis.Status.PENDING,
    )

    from celery_tasks.tasks.classification import classify_product_async

    classify_product_async(str(analysis.id))

    analysis.refresh_from_db()
    assert analysis.status == AIAnalysis.Status.COMPLETED
    assert analysis.output_data["category"] == "Electronics"


@pytest.mark.django_db
def test_task_marks_failed_on_error():
    analysis = AIAnalysisFactory(
        analysis_type=AIAnalysis.AnalysisType.DESCRIPTION,
        input_data={"product_title": "Test"},
        status=AIAnalysis.Status.PENDING,
    )

    with patch(
        "services.ai.openai_service.OpenAIService.generate_description"
    ) as mock_gen:
        mock_gen.side_effect = Exception("API timeout")
        with pytest.raises(Exception):
            from celery_tasks.tasks.description import \
                generate_description_async

            generate_description_async(str(analysis.id))

    analysis.refresh_from_db()
    assert analysis.status == AIAnalysis.Status.FAILED
    assert "API timeout" in analysis.error_message
