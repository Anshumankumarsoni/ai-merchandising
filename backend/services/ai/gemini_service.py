import logging

import google.generativeai as genai
from django.conf import settings
from tenacity import (retry, retry_if_exception_type, stop_after_attempt,
                      wait_exponential)

from .base import BaseAIService

logger = logging.getLogger(__name__)


class GeminiService(BaseAIService):
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            generation_config=genai.GenerationConfig(
                max_output_tokens=1000,
                temperature=0.7,
            ),
        )

    @retry(
        stop=stop_after_attempt(settings.AI_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    def _call(self, system_prompt: str, user_prompt: str) -> str:
        logger.debug("Gemini request: model=%s", settings.GEMINI_MODEL)
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = self._model.generate_content(combined_prompt)
        return response.text

    def classify_product(self, product_name: str) -> dict:
        from .prompts import CLASSIFICATION_SYSTEM, CLASSIFICATION_USER

        return self.call_structured(
            CLASSIFICATION_SYSTEM,
            CLASSIFICATION_USER.format(product_name=product_name),
        )
