# LearnTube

A mobile-optimized web app that turns YouTube videos into daily quiz sessions using spaced repetition. Paste a video URL, and LearnTube extracts the transcript, generates multiple-choice questions with AI, and schedules them using the SM-2 algorithm — so you actually retain what you watch.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite 6 |
| Backend | Python, FastAPI, SQLAlchemy (async), SQLite |
| AI | Google Gemini (model-agnostic — swappable via config) |
| Infrastructure | Docker Compose, Nginx |

## Architecture

```
┌─────────────────────────────────┐
│         Nginx (port 80)         │
│   Static files + /api proxy     │
└──────────┬──────────────────────┘
           │ /api/*
┌──────────▼──────────────────────┐
│     FastAPI Backend (8000)      │
│                                 │
│  routers/    → API endpoints    │
│  services/   → Business logic   │
│  ai/         → Provider layer   │
│  models/     → ORM (SQLAlchemy) │
└──────────┬──────────────────────┘
           │
    ┌──────▼──────┐
    │   SQLite    │
    └─────────────┘
```

**Frontend** (`/frontend/src/`) — React SPA with TanStack Query for server state and a state-machine hook (`useQuizSession`) driving the quiz flow. Tailwind CSS 4 with a Duolingo-inspired color palette. Mobile-first layout with bottom navigation and touch-optimized components.

**Backend** (`/backend/app/`) — FastAPI with async SQLAlchemy. Three router groups: videos (CRUD + transcript extraction + question generation), quiz (session building + answer submission + SM-2 updates), and progress (stats + streak tracking).

**AI Provider Layer** (`/backend/app/ai/`) — Abstract base class `AIProvider` with a factory pattern. Gemini is the primary implementation; OpenAI and Anthropic are stubbed. Switch providers by changing `AI_PROVIDER` in `.env`.

**Spaced Repetition** — Modified SM-2 algorithm. Correct answers space out (1d → 3d → interval × ease factor). Incorrect answers resurface next session. Daily sessions mix due reviews, new questions, and reinforcement of the hardest items.

## Project Structure

```
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI app, CORS, lifespan
│       ├── config.py            # Pydantic Settings (env-driven)
│       ├── database.py          # Async SQLAlchemy engine
│       ├── models/              # Video, Question, UserProgress, DailyStats
│       ├── schemas/             # Pydantic request/response models
│       ├── routers/             # videos, quiz, progress endpoints
│       ├── services/            # transcript, quiz_generator, spaced_repetition, session_builder
│       └── ai/                  # base ABC, gemini, openai (stub), anthropic (stub), factory
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/client.ts        # Axios wrapper
        ├── hooks/               # useQuizSession, useVideos, useProgress
        ├── components/          # layout/, quiz/, video/, progress/
        ├── pages/               # HomePage, QuizPage, LibraryPage, AddVideoPage, ProgressPage
        └── types/index.ts       # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites

- A [Google Gemini API key](https://aistudio.google.com/apikey)
- Docker and Docker Compose **or** Node.js 22+ and Python 3.13+

### Configuration

Copy the example env file and add your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.5-flash
```

### Deploy with Docker (recommended)

```bash
docker-compose up --build
```

The app will be available at `http://localhost:3000`. The Nginx container serves the frontend and proxies `/api/*` requests to the backend.

To run in the background:

```bash
docker-compose up --build -d
```

To stop:

```bash
docker-compose down
```

Data is persisted in a Docker volume (`sqlite-data`). To reset all data:

```bash
docker-compose down -v
```

### Local Development (without Docker)

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` requests to the backend automatically (configured in `vite.config.ts`).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/videos` | Add video — extracts transcript, generates questions |
| `GET` | `/api/videos` | List all videos with mastery percentages |
| `GET` | `/api/videos/:id` | Video detail with questions |
| `DELETE` | `/api/videos/:id` | Delete video and all associated data |
| `GET` | `/api/quiz/session` | Get today's quiz session |
| `POST` | `/api/quiz/answer` | Submit an answer, returns correctness + SM-2 update |
| `POST` | `/api/quiz/session/complete` | Mark session complete, update daily stats |
| `GET` | `/api/progress/overview` | Overall stats (mastery %, streak, totals) |
| `GET` | `/api/progress/streak` | Streak data + 90-day calendar |
| `GET` | `/api/progress/daily` | Last 30 days of daily stats |

## Adding a New AI Provider

1. Create a new file in `backend/app/ai/` (e.g., `ollama.py`)
2. Implement the `AIProvider` abstract class from `base.py`:
   - `generate_questions(transcript_chunk, num_questions, existing_questions)` — returns a list of `GeneratedQuestion`
   - `health_check()` — returns a boolean
3. Register it in `backend/app/ai/factory.py` by adding a new case to the match statement
4. Add any needed config fields to `backend/app/config.py`
5. Set `AI_PROVIDER=your_provider` in `.env`
