export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  video_id: string;
  question_text: string;
  choices: Choice[];
  difficulty: string;
  created_at: string;
}

export interface Video {
  id: string;
  youtube_id: string;
  url: string;
  title: string;
  channel: string | null;
  thumbnail_url: string;
  question_count: number;
  created_at: string;
  mastery_percentage: number;
}

export interface VideoDetail extends Video {
  transcript_text: string;
  questions: Question[];
}

export interface QuizSession {
  questions: Question[];
  total: number;
  review_count: number;
  new_count: number;
}

export interface AnswerResult {
  is_correct: boolean;
  correct_choice_id: string;
  explanation: string;
  streak: number;
  ease_factor: number;
  next_review_at: string;
}

export interface SessionSummary {
  questions_answered: number;
  questions_correct: number;
  accuracy: number;
  streak: number;
}

export interface ProgressOverview {
  total_videos: number;
  total_questions: number;
  questions_seen: number;
  mastery_percentage: number;
  current_streak: number;
  total_correct: number;
  total_incorrect: number;
}

export interface DailyStats {
  date: string;
  questions_answered: number;
  questions_correct: number;
  accuracy: number;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  calendar: DailyStats[];
}
