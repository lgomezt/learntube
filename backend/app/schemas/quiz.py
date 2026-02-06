from pydantic import BaseModel

from app.schemas.question import QuestionResponse


class QuizSession(BaseModel):
    questions: list[QuestionResponse]
    total: int
    review_count: int
    new_count: int


class AnswerSubmit(BaseModel):
    question_id: str
    chosen_choice_id: str


class AnswerResult(BaseModel):
    is_correct: bool
    correct_choice_id: str
    explanation: str
    streak: int
    ease_factor: float
    next_review_at: str


class SessionComplete(BaseModel):
    questions_answered: int
    questions_correct: int


class SessionSummary(BaseModel):
    questions_answered: int
    questions_correct: int
    accuracy: float
    streak: int
