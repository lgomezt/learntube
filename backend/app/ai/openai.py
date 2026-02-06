from app.ai.base import AIProvider, GeneratedQuestion


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model

    async def generate_questions(
        self,
        transcript_chunk: str,
        num_questions: int = 4,
        existing_questions: list[str] | None = None,
    ) -> list[GeneratedQuestion]:
        raise NotImplementedError("OpenAI provider not yet implemented")

    async def health_check(self) -> bool:
        return False
