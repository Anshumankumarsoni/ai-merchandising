import json
from unittest.mock import MagicMock, patch

import pytest

from services.ai.base import BaseAIService

# ── Base service JSON parsing ──────────────────────────────────────────────────


class ConcreteAIService(BaseAIService):
    def __init__(self, raw_response: str):
        self._raw = raw_response

    def _call(self, system_prompt, user_prompt):
        return self._raw


def test_call_structured_valid_json():
    svc = ConcreteAIService('{"key": "value"}')
    result = svc.call_structured("system", "user")
    assert result == {"key": "value"}


def test_call_structured_strips_markdown_fences():
    svc = ConcreteAIService('```json\n{"key": "value"}\n```')
    result = svc.call_structured("system", "user")
    assert result == {"key": "value"}


def test_call_structured_raises_on_invalid_json():
    svc = ConcreteAIService("not valid json at all")
    with pytest.raises(ValueError, match="not valid JSON"):
        svc.call_structured("system", "user")


# ── OpenAI service ─────────────────────────────────────────────────────────────


@pytest.mark.django_db
@patch("services.ai.openai_service.OpenAI")
def test_generate_description(mock_openai, settings):
    settings.OPENAI_API_KEY = "test-key"
    settings.OPENAI_MODEL = "gpt-4o-mini"
    settings.AI_REQUEST_TIMEOUT = 30
    settings.AI_MAX_RETRIES = 1

    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(
        {
            "seo_title": "Test Title",
            "description": "Test description",
            "features": ["Feature 1"],
            "keywords": ["keyword1"],
        }
    )
    mock_usage = MagicMock()
    mock_usage.total_tokens = 100
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    mock_response.usage = mock_usage
    mock_openai.return_value.chat.completions.create.return_value = mock_response

    from services.ai.openai_service import OpenAIService

    svc = OpenAIService()
    result = svc.generate_description("Test Product")

    assert result["seo_title"] == "Test Title"
    assert "description" in result
    assert isinstance(result["features"], list)


# ── Gemini service ─────────────────────────────────────────────────────────────


@pytest.mark.django_db
@patch("services.ai.gemini_service.genai")
def test_classify_product(mock_genai, settings):
    settings.GEMINI_API_KEY = "test-key"
    settings.GEMINI_MODEL = "gemini-1.5-flash"
    settings.AI_MAX_RETRIES = 1

    mock_response = MagicMock()
    mock_response.text = json.dumps(
        {
            "category": "Electronics",
            "subcategory": "Audio",
            "confidence": 0.95,
            "reasoning": "This is a headphone product.",
        }
    )
    mock_genai.GenerativeModel.return_value.generate_content.return_value = (
        mock_response
    )

    from services.ai.gemini_service import GeminiService

    svc = GeminiService()
    result = svc.classify_product("Sony WH-1000XM5 Headphones")

    assert result["category"] == "Electronics"
    assert result["confidence"] == 0.95
