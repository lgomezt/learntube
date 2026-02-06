import random
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import settings
from app.models.question import Question
from app.models.progress import UserProgress
from app.models.video import Video


async def build_session(
    db: AsyncSession, session_size: int | None = None
) -> tuple[list[Question], int, int]:
    """Build a daily quiz session. Returns (questions, review_count, new_count)."""
    size = session_size or settings.default_session_size
    size = max(settings.min_session_size, min(size, settings.max_session_size))
    now = datetime.now(timezone.utc)

    # 1. Due reviews — most overdue first
    review_stmt = (
        select(Question)
        .join(UserProgress)
        .where(UserProgress.next_review_at <= now)
        .where(UserProgress.last_reviewed_at.isnot(None))
        .order_by(UserProgress.next_review_at.asc())
        .limit(min(size, settings.max_review_per_session))
        .options(joinedload(Question.progress))
    )
    review_result = await db.execute(review_stmt)
    review_questions = list(review_result.unique().scalars().all())
    review_count = len(review_questions)

    remaining = size - review_count
    selected_ids = {q.id for q in review_questions}

    # 2. New (unseen) questions
    new_questions = []
    if remaining > 0:
        new_stmt = (
            select(Question)
            .join(UserProgress)
            .join(Video)
            .where(UserProgress.last_reviewed_at.is_(None))
            .where(Question.id.notin_(selected_ids) if selected_ids else True)
            .order_by(Video.created_at.asc(), Question.segment_start.asc())
            .limit(remaining)
            .options(joinedload(Question.progress))
        )
        new_result = await db.execute(new_stmt)
        new_questions = list(new_result.unique().scalars().all())
        selected_ids.update(q.id for q in new_questions)

    new_count = len(new_questions)
    remaining = size - review_count - new_count

    # 3. Reinforcement backfill — hardest questions
    reinforcement = []
    if remaining > 0:
        reinforce_stmt = (
            select(Question)
            .join(UserProgress)
            .where(Question.id.notin_(selected_ids) if selected_ids else True)
            .order_by(UserProgress.ease_factor.asc())
            .limit(remaining)
            .options(joinedload(Question.progress))
        )
        reinforce_result = await db.execute(reinforce_stmt)
        reinforcement = list(reinforce_result.unique().scalars().all())

    session = review_questions + new_questions + reinforcement
    random.shuffle(session)

    return session, review_count, new_count
