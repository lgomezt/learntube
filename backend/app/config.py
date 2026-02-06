from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./data/app.db"

    # AI Provider
    ai_provider: str = "gemini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    # Quiz settings
    default_session_size: int = 15
    max_session_size: int = 20
    min_session_size: int = 5
    max_review_per_session: int = 10
    questions_per_chunk: int = 4
    transcript_chunk_words: int = 600
    transcript_chunk_overlap: int = 50

    # SM-2 tuning
    sm2_first_interval: float = 1.0
    sm2_second_interval: float = 3.0
    sm2_incorrect_interval: float = 0.25
    sm2_min_ease_factor: float = 1.3

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
