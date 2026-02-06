from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.video import Video
from app.models.question import Question
from app.models.progress import UserProgress, DailyStats
from app.schemas.progress import (
    ProgressOverview,
    VideoMastery,
    DailyStatsResponse,
    StreakResponse,
)

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/overview", response_model=ProgressOverview)
async def get_overview(db: AsyncSession = Depends(get_db)):
    video_count = await db.scalar(select(func.count(Video.id)))
    question_count = await db.scalar(select(func.count(Question.id)))

    seen_count = await db.scalar(
        select(func.count(UserProgress.id)).where(
            UserProgress.last_reviewed_at.isnot(None)
        )
    )
    mastered_count = await db.scalar(
        select(func.count(UserProgress.id)).where(UserProgress.repetitions >= 3)
    )
    total_correct = await db.scalar(
        select(func.coalesce(func.sum(UserProgress.times_correct), 0))
    )
    total_incorrect = await db.scalar(
        select(func.coalesce(func.sum(UserProgress.times_incorrect), 0))
    )

    mastery_pct = round(mastered_count / question_count * 100, 1) if question_count else 0.0

    streak = await _compute_streak(db)

    return ProgressOverview(
        total_videos=video_count or 0,
        total_questions=question_count or 0,
        questions_seen=seen_count or 0,
        mastery_percentage=mastery_pct,
        current_streak=streak,
        total_correct=total_correct or 0,
        total_incorrect=total_incorrect or 0,
    )


@router.get("/videos/{video_id}", response_model=VideoMastery)
async def get_video_mastery(video_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Video)
        .where(Video.id == video_id)
        .options(joinedload(Video.questions).joinedload(Question.progress))
    )
    result = await db.execute(stmt)
    video = result.unique().scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    mastered = sum(1 for q in video.questions if q.progress and q.progress.repetitions >= 3)
    total = len(video.questions)

    return VideoMastery(
        video_id=video.id,
        title=video.title,
        thumbnail_url=video.thumbnail_url,
        total_questions=total,
        questions_mastered=mastered,
        mastery_percentage=round(mastered / total * 100, 1) if total else 0.0,
    )


@router.get("/streak", response_model=StreakResponse)
async def get_streak(db: AsyncSession = Depends(get_db)):
    stmt = select(DailyStats).order_by(DailyStats.date.desc()).limit(90)
    result = await db.execute(stmt)
    all_stats = result.scalars().all()

    current_streak = 0
    longest_streak = 0
    expected = date.today()
    for s in all_stats:
        if s.date == expected:
            current_streak += 1
            expected = date.fromordinal(expected.toordinal() - 1)
        elif current_streak > 0:
            break

    # Compute longest streak from all stats
    all_dates = sorted([s.date for s in all_stats])
    temp_streak = 0
    for i, d in enumerate(all_dates):
        if i == 0 or d.toordinal() - all_dates[i - 1].toordinal() == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
    longest_streak = max(longest_streak, temp_streak, current_streak)

    calendar = [
        DailyStatsResponse(
            date=s.date,
            questions_answered=s.questions_answered,
            questions_correct=s.questions_correct,
            accuracy=(
                round(s.questions_correct / s.questions_answered * 100, 1)
                if s.questions_answered > 0
                else 0
            ),
        )
        for s in all_stats
    ]

    return StreakResponse(
        current_streak=current_streak,
        longest_streak=longest_streak,
        calendar=calendar,
    )


@router.get("/daily", response_model=list[DailyStatsResponse])
async def get_daily_stats(db: AsyncSession = Depends(get_db)):
    stmt = select(DailyStats).order_by(DailyStats.date.desc()).limit(30)
    result = await db.execute(stmt)
    stats = result.scalars().all()

    return [
        DailyStatsResponse(
            date=s.date,
            questions_answered=s.questions_answered,
            questions_correct=s.questions_correct,
            accuracy=(
                round(s.questions_correct / s.questions_answered * 100, 1)
                if s.questions_answered > 0
                else 0
            ),
        )
        for s in stats
    ]


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
