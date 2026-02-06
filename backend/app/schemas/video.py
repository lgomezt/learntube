from datetime import datetime

from pydantic import BaseModel


class VideoCreate(BaseModel):
    url: str


class VideoResponse(BaseModel):
    id: str
    youtube_id: str
    url: str
    title: str
    channel: str | None
    thumbnail_url: str
    question_count: int
    created_at: datetime
    mastery_percentage: float = 0.0

    model_config = {"from_attributes": True}


class VideoDetail(VideoResponse):
    transcript_text: str
    questions: list["QuestionResponse"] = []


from app.schemas.question import QuestionResponse  # noqa: E402

VideoDetail.model_rebuild()
