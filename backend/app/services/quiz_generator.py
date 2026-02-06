import uuid
import logging
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.base import AIProvider
from app.config import settings
from app.models.question import Question
from app.models.progress import UserProgress
from app.services.transcript import TranscriptService

logger = logging.getLogger(__name__)


class QuizGenerator:
    def __init__(self, ai_provider: AIProvider):
        self.ai = ai_provider
        self.transcript_service = TranscriptService()

    async def generate_questions_for_video(
        self, db: AsyncSession, video_id: str, transcript_text: str
    ) -> list[Question]:
        chunks = self.transcript_service.chunk_transcript(
            transcript_text,
            chunk_size=settings.transcript_chunk_words,
            overlap=settings.transcript_chunk_overlap,
        )

        all_questions: list[Question] = []
        existing_texts: list[str] = []

        for i, chunk in enumerate(chunks):
            logger.info(f"Processing chunk {i + 1}/{len(chunks)}")
            try:
                generated = await self.ai.generate_questions(
                    transcript_chunk=chunk["text"],
                    num_questions=settings.questions_per_chunk,
                    existing_questions=existing_texts[-10:] if existing_texts else None,
                )
            except Exception as e:
                logger.error(f"Failed to generate questions for chunk {i + 1}: {e}")
                continue

            for gq in generated:
                question = Question(
                    id=str(uuid.uuid4()),
                    video_id=video_id,
                    question_text=gq.question_text,
                    choices=[c.model_dump() for c in gq.choices],
                    correct_choice_id=gq.correct_choice_id,
                    explanation=gq.explanation,
                    difficulty=gq.difficulty,
                )
                db.add(question)

                progress = UserProgress(
                    id=str(uuid.uuid4()),
                    question_id=question.id,
                    next_review_at=datetime.now(timezone.utc),
                )
                db.add(progress)

                all_questions.append(question)
                existing_texts.append(gq.question_text)

        return all_questions
