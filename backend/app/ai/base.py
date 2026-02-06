from abc import ABC, abstractmethod

from pydantic import BaseModel


class GeneratedChoice(BaseModel):
    id: str
    text: str
    is_correct: bool


class GeneratedQuestion(BaseModel):
    question_text: str
    choices: list[GeneratedChoice]
    correct_choice_id: str
    explanation: str
    difficulty: str


class AIProvider(ABC):
    @abstractmethod
    async def generate_questions(
        self,
        transcript_chunk: str,
        num_questions: int = 4,
        existing_questions: list[str] | None = None,
    ) -> list[GeneratedQuestion]:
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        ...
