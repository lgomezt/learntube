from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.video import Video
from app.models.question import Question
from app.models.progress import UserProgress
from app.schemas.video import VideoCreate, VideoResponse, VideoDetail
from app.schemas.question import QuestionResponse, ChoiceResponse
from app.services.transcript import TranscriptService
from app.services.quiz_generator import QuizGenerator
from app.ai.factory import get_ai_provider
from app.config import settings

router = APIRouter(prefix="/api/videos", tags=["videos"])
transcript_service = TranscriptService()


def _compute_mastery(questions: list) -> float:
    if not questions:
        return 0.0
    mastered = sum(
        1
        for q in questions
        if q.progress and q.progress.repetitions >= 3
    )
    return round(mastered / len(questions) * 100, 1)


@router.post("", response_model=VideoResponse)
async def add_video(body: VideoCreate, db: AsyncSession = Depends(get_db)):
    try:
        video_id = TranscriptService.extract_video_id(body.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    existing = await db.execute(select(Video).where(Video.youtube_id == video_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Video already added")

    try:
        transcript_data = transcript_service.fetch_transcript(video_id)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not fetch transcript: {str(e)}",
        )

    video = Video(
        youtube_id=video_id,
        url=body.url,
        title=f"Video {video_id}",
        thumbnail_url=f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg",
        transcript_text=transcript_data["full_text"],
        transcript_segments=transcript_data["segments"],
    )
    db.add(video)
    await db.flush()

    ai_provider = get_ai_provider(settings)
    generator = QuizGenerator(ai_provider)
    questions = await generator.generate_questions_for_video(
        db, video.id, transcript_data["full_text"]
    )
    video.question_count = len(questions)

    await db.commit()
    await db.refresh(video)

    return VideoResponse(
        id=video.id,
        youtube_id=video.youtube_id,
        url=video.url,
        title=video.title,
        channel=video.channel,
        thumbnail_url=video.thumbnail_url,
        question_count=video.question_count,
        created_at=video.created_at,
        mastery_percentage=0.0,
    )


@router.get("", response_model=list[VideoResponse])
async def list_videos(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Video)
        .options(joinedload(Video.questions).joinedload(Question.progress))
        .order_by(Video.created_at.desc())
    )
    result = await db.execute(stmt)
    videos = result.unique().scalars().all()

    return [
        VideoResponse(
            id=v.id,
            youtube_id=v.youtube_id,
            url=v.url,
            title=v.title,
            channel=v.channel,
            thumbnail_url=v.thumbnail_url,
            question_count=v.question_count,
            created_at=v.created_at,
            mastery_percentage=_compute_mastery(v.questions),
        )
        for v in videos
    ]


@router.get("/{video_id}", response_model=VideoDetail)
async def get_video(video_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Video)
        .where(Video.id == video_id)
        .options(joinedload(Video.questions).joinedload(Question.progress))
    )
    result = await db.execute(stmt)
    video = result.unique().scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    questions_resp = [
        QuestionResponse(
            id=q.id,
            video_id=q.video_id,
            question_text=q.question_text,
            choices=[ChoiceResponse(id=c["id"], text=c["text"]) for c in q.choices],
            difficulty=q.difficulty,
            created_at=q.created_at,
        )
        for q in video.questions
    ]

    return VideoDetail(
        id=video.id,
        youtube_id=video.youtube_id,
        url=video.url,
        title=video.title,
        channel=video.channel,
        thumbnail_url=video.thumbnail_url,
        question_count=video.question_count,
        created_at=video.created_at,
        mastery_percentage=_compute_mastery(video.questions),
        transcript_text=video.transcript_text,
        questions=questions_resp,
    )


@router.delete("/{video_id}")
async def delete_video(video_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Video).where(Video.id == video_id)
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    await db.delete(video)
    await db.commit()
    return {"ok": True}
