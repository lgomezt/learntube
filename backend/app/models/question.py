import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id: Mapped[str] = mapped_column(String, ForeignKey("videos.id", ondelete="CASCADE"))
    question_text: Mapped[str] = mapped_column(Text)
    choices: Mapped[list] = mapped_column(JSON)
    correct_choice_id: Mapped[str] = mapped_column(String)
    explanation: Mapped[str] = mapped_column(Text, default="")
    segment_start: Mapped[float | None] = mapped_column(Float, nullable=True)
    segment_end: Mapped[float | None] = mapped_column(Float, nullable=True)
    difficulty: Mapped[str] = mapped_column(String, default="medium")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    video = relationship("Video", back_populates="questions")
    progress = relationship("UserProgress", back_populates="question", uselist=False, cascade="all, delete-orphan")
