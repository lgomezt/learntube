from datetime import datetime, timedelta, timezone

from app.config import settings
from app.models.progress import UserProgress


def update_progress(progress: UserProgress, is_correct: bool) -> UserProgress:
    if is_correct:
        quality = 4
        progress.times_correct += 1
        progress.streak += 1

        if progress.repetitions == 0:
            progress.interval_days = settings.sm2_first_interval
        elif progress.repetitions == 1:
            progress.interval_days = settings.sm2_second_interval
        else:
            progress.interval_days = progress.interval_days * progress.ease_factor

        progress.repetitions += 1
    else:
        quality = 1
        progress.times_incorrect += 1
        progress.streak = 0
        progress.repetitions = 0
        progress.interval_days = settings.sm2_incorrect_interval

    progress.ease_factor = max(
        settings.sm2_min_ease_factor,
        progress.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    )

    now = datetime.now(timezone.utc)
    progress.last_reviewed_at = now
    progress.next_review_at = now + timedelta(days=progress.interval_days)

    return progress
