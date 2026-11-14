import os
import json
import logging
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("openrouter_client")

# Curated list of 100% free models on OpenRouter
AVAILABLE_FREE_MODELS = [
    {
        "id": "openrouter/free",
        "name": "OpenRouter Auto-Free Router",
        "provider": "OpenRouter",
        "description": "Automatically routes to the fastest available top-tier free model"
    },
    {
        "id": "google/gemini-2.0-flash-exp:free",
        "name": "Gemini 2.0 Flash (Free)",
        "provider": "Google",
        "description": "Ultra-fast multimodal reasoning with 1M context window"
    },
    {
        "id": "meta-llama/llama-3.3-70b-instruct:free",
        "name": "Llama 3.3 70B Instruct (Free)",
        "provider": "Meta",
        "description": "High-intelligence open-weights model for deep coding & tutoring"
    },
    {
        "id": "mistralai/mistral-7b-instruct:free",
        "name": "Mistral 7B Instruct (Free)",
        "provider": "Mistral AI",
        "description": "Efficient, concise, high-speed conversational model"
    },
    {
        "id": "qwen/qwen-2.5-coder-32b-instruct:free",
        "name": "Qwen 2.5 Coder 32B (Free)",
        "provider": "Qwen",
        "description": "Specialized code generation & technical explanation model"
    }
]


class OpenRouterClient:
    """
    OpenRouter API Gateway client with multi-model failover across verified free models
    and deterministic fallback.
    """

    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        self.model = os.getenv("OPENROUTER_MODEL", "openrouter/free").strip()
        self.base_url = "https://openrouter.ai/api/v1"
        self._client = None
        self.available_models = AVAILABLE_FREE_MODELS

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key != "replace_with_your_key")

    def set_model(self, model_id: str) -> bool:
        valid_ids = [m["id"] for m in self.available_models]
        if model_id in valid_ids or ":free" in model_id or "openrouter/" in model_id:
            self.model = model_id
            return True
        return False

    def _get_async_client(self):
        if self._client is None and self.is_configured:
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=25.0
            )
        return self._client

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 1500
    ) -> Optional[str]:
        """
        Sends chat completion request to OpenRouter with automatic failover across 3+ free models.
        """
        if not self.is_configured:
            logger.info("OpenRouter API key not configured. Using deterministic fallback.")
            return None

        client = self._get_async_client()
        if not client:
            return None

        # Build candidate models order starting with active model
        candidates = [self.model]
        for m in self.available_models:
            if m["id"] not in candidates:
                candidates.append(m["id"])

        # Try active model, then failover to other free models
        for candidate_model in candidates[:3]:
            try:
                response = await client.chat.completions.create(
                    model=candidate_model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    extra_headers={
                        "HTTP-Referer": "https://skillbridge-ai.local",
                        "X-Title": "SkillBridge AI"
                    }
                )
                content = response.choices[0].message.content or ""
                if content.strip():
                    return content.strip()
            except Exception as e:
                logger.warning(
                    f"OpenRouter model '{candidate_model}' attempt failed ({type(e).__name__}): {e}. Trying next free model..."
                )
                continue

        logger.warning("All OpenRouter free models exhausted. Engaging deterministic fallback.")
        return None

    async def generate_structured_json(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2
    ) -> Optional[Dict[str, Any]]:
        """
        Extracts structured JSON from model response with markdown fence stripping and validation.
        """
        raw_text = await self.generate_chat_completion(messages, temperature=temperature)
        if not raw_text:
            return None

        clean_text = raw_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()

        try:
            parsed = json.loads(clean_text)
            if isinstance(parsed, dict):
                return parsed
            return {"data": parsed}
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse LLM JSON response: {e}")
            return None


openrouter_client = OpenRouterClient()
