from datetime import date

from pydantic import BaseModel


class ProgressOverview(BaseModel):
    total_videos: int
    total_questions: int
    questions_seen: int
    mastery_percentage: float
    current_streak: int
    total_correct: int
    total_incorrect: int


class VideoMastery(BaseModel):
    video_id: str
    title: str
    thumbnail_url: str
    total_questions: int
    questions_mastered: int
    mastery_percentage: float


class DailyStatsResponse(BaseModel):
    date: date
    questions_answered: int
    questions_correct: int
    accuracy: float


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    calendar: list[DailyStatsResponse]
