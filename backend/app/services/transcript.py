import re

from youtube_transcript_api import YouTubeTranscriptApi


class TranscriptService:
    def __init__(self):
        self.api = YouTubeTranscriptApi()

    @staticmethod
    def extract_video_id(url: str) -> str:
        patterns = [
            r"(?:v=|/v/|youtu\.be/)([a-zA-Z0-9_-]{11})",
            r"(?:embed/)([a-zA-Z0-9_-]{11})",
            r"^([a-zA-Z0-9_-]{11})$",
        ]
        for pattern in patterns:
            match = re.search(pattern, url.strip())
            if match:
                return match.group(1)
        raise ValueError(f"Could not extract video ID from: {url}")

    def fetch_transcript(self, video_id: str) -> dict:
        transcript = self.api.fetch(video_id, languages=["en"])

        segments = [
            {"text": snippet.text, "start": snippet.start, "duration": snippet.duration}
            for snippet in transcript
        ]
        full_text = " ".join(s["text"] for s in segments)

        return {
            "video_id": video_id,
            "segments": segments,
            "full_text": full_text,
        }

    @staticmethod
    def chunk_transcript(full_text: str, chunk_size: int = 600, overlap: int = 50) -> list[dict]:
        words = full_text.split()
        if not words:
            return []

        chunks = []
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_text = " ".join(words[start:end])
            chunks.append({"text": chunk_text, "word_start": start, "word_end": end})
            if end >= len(words):
                break
            start = end - overlap

        return chunks
