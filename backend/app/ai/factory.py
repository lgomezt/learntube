from app.ai.base import AIProvider
from app.config import Settings


def get_ai_provider(config: Settings) -> AIProvider:
    match config.ai_provider:
        case "gemini":
            from app.ai.gemini import GeminiProvider

            return GeminiProvider(api_key=config.gemini_api_key, model=config.gemini_model)
        case "openai":
            from app.ai.openai import OpenAIProvider

            return OpenAIProvider(api_key=config.openai_api_key, model=config.openai_model)
        case "anthropic":
            from app.ai.anthropic import AnthropicProvider

            return AnthropicProvider(
                api_key=config.anthropic_api_key, model=config.anthropic_model
            )
        case _:
            raise ValueError(f"Unknown AI provider: {config.ai_provider}")
