import json
import re
import uuid
import asyncio
import logging

from google import genai
from google.genai import types

from app.ai.base import AIProvider, GeneratedQuestion, GeneratedChoice

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert educational assessment designer. Your task is to create multiple-choice quiz questions that test comprehension of video content.

Rules:
1. Each question must have exactly 4 answer choices labeled A, B, C, D.
2. Exactly one choice must be correct.
3. Wrong choices (distractors) must be plausible but clearly incorrect.
4. Questions should test understanding, not trivial memorization.
5. Cover different cognitive levels: recall, comprehension, application.
6. Each question must include a brief explanation of why the correct answer is right.
7. Assign a difficulty: "easy", "medium", or "hard".
8. Vary question types: factual, conceptual, cause-effect, comparison.
9. Make questions self-contained — answerable without watching the video.

Return a JSON object with a "questions" array. Each question has:
- "question_text": the question
- "choices": array of 4 objects with "label" (A/B/C/D), "text", and "is_correct" (boolean)
- "explanation": why the correct answer is right
- "difficulty": "easy", "medium", or "hard"

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text.
"""

MAX_RETRIES = 2


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gemini-3-flash-preview"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def generate_questions(
        self,
        transcript_chunk: str,
        num_questions: int = 4,
        existing_questions: list[str] | None = None,
    ) -> list[GeneratedQuestion]:
        user_prompt = f"Generate {num_questions} multiple-choice questions from this video transcript segment.\n\nTRANSCRIPT:\n---\n{transcript_chunk}\n---\n"

        if existing_questions:
            user_prompt += "\nAvoid generating questions similar to these already-generated questions:\n"
            for q in existing_questions[-10:]:
                user_prompt += f"- {q}\n"

        user_prompt += "\nReturn the questions as a JSON object with a 'questions' array. Only valid JSON, nothing else."

        for attempt in range(MAX_RETRIES + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        temperature=0.7,
                    ),
                )
                return self._parse_response(response.text)
            except (json.JSONDecodeError, KeyError, TypeError) as e:
                logger.warning(f"Gemini parse error (attempt {attempt + 1}): {e}")
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(1)
                    continue
                logger.error(f"Gemini failed after {MAX_RETRIES + 1} attempts, skipping chunk")
                return []
            except Exception as e:
                logger.error(f"Gemini API error: {e}")
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(2)
                    continue
                return []

        return []

    def _parse_response(self, text: str) -> list[GeneratedQuestion]:
        # Strip markdown code fences if present
        cleaned = text.strip()
        cleaned = re.sub(r"^```(?:json)?\s*\n?", "", cleaned)
        cleaned = re.sub(r"\n?```\s*$", "", cleaned)

        data = json.loads(cleaned)
        questions_data = data.get("questions", data) if isinstance(data, dict) else data

        if not isinstance(questions_data, list):
            raise TypeError(f"Expected list of questions, got {type(questions_data)}")

        result = []
        for q in questions_data:
            try:
                choices = []
                correct_id = None
                for c in q["choices"]:
                    choice_id = str(uuid.uuid4())[:8]
                    choices.append(
                        GeneratedChoice(
                            id=choice_id,
                            text=c["text"],
                            is_correct=c.get("is_correct", False),
                        )
                    )
                    if c.get("is_correct", False):
                        correct_id = choice_id

                if not correct_id or len(choices) != 4:
                    continue

                result.append(
                    GeneratedQuestion(
                        question_text=q["question_text"],
                        choices=choices,
                        correct_choice_id=correct_id,
                        explanation=q.get("explanation", ""),
                        difficulty=q.get("difficulty", "medium"),
                    )
                )
            except (KeyError, TypeError) as e:
                logger.warning(f"Skipping malformed question: {e}")
                continue

        return result

    async def health_check(self) -> bool:
        try:
            self.client.models.get(model=self.model)
            return True
        except Exception:
            return False
