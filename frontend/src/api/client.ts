import axios from 'axios';
import type {
  Video,
  VideoDetail,
  QuizSession,
  AnswerResult,
  SessionSummary,
  ProgressOverview,
  StreakData,
  DailyStats,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const videosApi = {
  add: (url: string) =>
    api.post<Video>('/videos', { url }, { timeout: 5 * 60 * 1000 }).then((r) => r.data),
  list: () => api.get<Video[]>('/videos').then((r) => r.data),
  get: (id: string) => api.get<VideoDetail>(`/videos/${id}`).then((r) => r.data),
  delete: (id: string) => api.delete(`/videos/${id}`).then((r) => r.data),
};

export const quizApi = {
  getSession: () => api.get<QuizSession>('/quiz/session').then((r) => r.data),
  submitAnswer: (questionId: string, chosenChoiceId: string) =>
    api
      .post<AnswerResult>('/quiz/answer', {
        question_id: questionId,
        chosen_choice_id: chosenChoiceId,
      })
      .then((r) => r.data),
  completeSession: (answered: number, correct: number) =>
    api
      .post<SessionSummary>('/quiz/session/complete', {
        questions_answered: answered,
        questions_correct: correct,
      })
      .then((r) => r.data),
};

export const progressApi = {
  getOverview: () => api.get<ProgressOverview>('/progress/overview').then((r) => r.data),
  getStreak: () => api.get<StreakData>('/progress/streak').then((r) => r.data),
  getDaily: () => api.get<DailyStats[]>('/progress/daily').then((r) => r.data),
};
