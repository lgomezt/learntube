from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.question import Question
from app.models.progress import UserProgress, DailyStats
from app.schemas.quiz import (
    QuizSession,
    AnswerSubmit,
    AnswerResult,
    SessionComplete,
    SessionSummary,
)
from app.schemas.question import QuestionResponse, ChoiceResponse
from app.services.session_builder import build_session
from app.services.spaced_repetition import update_progress

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.get("/session", response_model=QuizSession)
async def get_session(db: AsyncSession = Depends(get_db)):
    questions, review_count, new_count = await build_session(db)

    question_responses = [
        QuestionResponse(
            id=q.id,
            video_id=q.video_id,
            question_text=q.question_text,
            choices=[ChoiceResponse(id=c["id"], text=c["text"]) for c in q.choices],
            difficulty=q.difficulty,
            created_at=q.created_at,
        )
        for q in questions
    ]

    return QuizSession(
        questions=question_responses,
        total=len(questions),
        review_count=review_count,
        new_count=new_count,
    )


@router.post("/answer", response_model=AnswerResult)
async def submit_answer(body: AnswerSubmit, db: AsyncSession = Depends(get_db)):
    stmt = select(Question).where(Question.id == body.question_id)
    result = await db.execute(stmt)
    question = result.scalar_one_or_none()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    progress_stmt = select(UserProgress).where(
        UserProgress.question_id == body.question_id
    )
    progress_result = await db.execute(progress_stmt)
    progress = progress_result.scalar_one_or_none()

    if not progress:
        raise HTTPException(status_code=404, detail="Progress record not found")

    is_correct = body.chosen_choice_id == question.correct_choice_id
    update_progress(progress, is_correct)

    await db.commit()
    await db.refresh(progress)

    return AnswerResult(
        is_correct=is_correct,
        correct_choice_id=question.correct_choice_id,
        explanation=question.explanation,
        streak=progress.streak,
        ease_factor=progress.ease_factor,
        next_review_at=progress.next_review_at.isoformat(),
    )


@router.post("/session/complete", response_model=SessionSummary)
async def complete_session(body: SessionComplete, db: AsyncSession = Depends(get_db)):
    today = date.today()

    stmt = select(DailyStats).where(DailyStats.date == today)
    result = await db.execute(stmt)
    stats = result.scalar_one_or_none()

    if stats:
        stats.questions_answered += body.questions_answered
        stats.questions_correct += body.questions_correct
        stats.session_count += 1
    else:
        stats = DailyStats(
            date=today,
            questions_answered=body.questions_answered,
            questions_correct=body.questions_correct,
            session_count=1,
        )
        db.add(stats)

    await db.commit()

    # Compute current streak
    streak = await _compute_streak(db)

    accuracy = (
        body.questions_correct / body.questions_answered * 100
        if body.questions_answered > 0
        else 0
    )

    return SessionSummary(
        questions_answered=body.questions_answered,
        questions_correct=body.questions_correct,
        accuracy=round(accuracy, 1),
        streak=streak,
    )


async def _compute_streak(db: AsyncSession) -> int:
    stmt = select(DailyStats).order_by(DailyStats.date.desc())
    result = await db.execute(stmt)
    all_stats = result.scalars().all()

    streak = 0
    expected = date.today()
    for s in all_stats:
        if s.date == expected:
            streak += 1
            expected = date.fromordinal(expected.toordinal() - 1)
        else:
            break

    return streak
