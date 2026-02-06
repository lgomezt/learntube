from datetime import datetime

from pydantic import BaseModel


class ChoiceResponse(BaseModel):
    id: str
    text: str


class QuestionResponse(BaseModel):
    id: str
    video_id: str
    question_text: str
    choices: list[ChoiceResponse]
    difficulty: str
    created_at: datetime

    model_config = {"from_attributes": True}


class QuestionWithAnswer(QuestionResponse):
    correct_choice_id: str
    explanation: str
