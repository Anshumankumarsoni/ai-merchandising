import logging

from django.conf import settings
from openai import OpenAI
from tenacity import (retry, retry_if_exception_type, stop_after_attempt,
                      wait_exponential)

from .base import BaseAIService

logger = logging.getLogger(__name__)


class OpenAIService(BaseAIService):
    def __init__(self):
        self._client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.AI_REQUEST_TIMEOUT,
        )
        self._model = settings.OPENAI_MODEL

    @retry(
        stop=stop_after_attempt(settings.AI_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    def _call(self, system_prompt: str, user_prompt: str) -> str:
        logger.debug("OpenAI request: model=%s", self._model)
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=1000,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        logger.debug("OpenAI response tokens: %d", response.usage.total_tokens)
        return content

    def generate_description(self, product_title: str) -> dict:
        from .prompts import DESCRIPTION_SYSTEM, DESCRIPTION_USER

        return self.call_structured(
            DESCRIPTION_SYSTEM,
            DESCRIPTION_USER.format(product_title=product_title),
        )

    def analyze_reviews(self, reviews: list[str]) -> dict:
        from .prompts import REVIEW_ANALYSIS_SYSTEM, REVIEW_ANALYSIS_USER

        reviews_text = "\n---\n".join(reviews)
        return self.call_structured(
            REVIEW_ANALYSIS_SYSTEM,
            REVIEW_ANALYSIS_USER.format(reviews=reviews_text),
        )

    def analyze_listing_quality(self, title: str, description: str) -> dict:
        from .prompts import LISTING_QUALITY_SYSTEM, LISTING_QUALITY_USER

        return self.call_structured(
            LISTING_QUALITY_SYSTEM,
            LISTING_QUALITY_USER.format(title=title, description=description),
        )
