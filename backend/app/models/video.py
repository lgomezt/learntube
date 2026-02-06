import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    youtube_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    url: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String, default="")
    channel: Mapped[str | None] = mapped_column(String, nullable=True)
    thumbnail_url: Mapped[str] = mapped_column(String, default="")
    transcript_text: Mapped[str] = mapped_column(Text, default="")
    transcript_segments: Mapped[list] = mapped_column(JSON, default=list)
    question_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    questions = relationship("Question", back_populates="video", cascade="all, delete-orphan")
