import json
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class BaseAIService(ABC):
    """Abstract base for all AI provider services."""

    @abstractmethod
    def _call(self, system_prompt: str, user_prompt: str) -> str:
        """Make the raw API call and return the text response."""
        ...

    def call_structured(self, system_prompt: str, user_prompt: str) -> dict:
        """Call the AI and parse JSON response. Raises ValueError on bad JSON."""
        raw = self._call(system_prompt, user_prompt)
        try:
            # Strip markdown code fences if present
            cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("AI returned non-JSON response: %s", raw[:500])
            raise ValueError(f"AI response was not valid JSON: {exc}") from exc
