import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quizApi } from '../api/client';
import type { Question, AnswerResult, SessionSummary } from '../types';

type QuizState =
  | { status: 'loading' }
  | { status: 'empty' }
  | {
      status: 'ready';
      questions: Question[];
      currentIndex: number;
      reviewCount: number;
      newCount: number;
    }
  | {
      status: 'feedback';
      questions: Question[];
      currentIndex: number;
      result: AnswerResult;
      selectedChoiceId: string;
      reviewCount: number;
      newCount: number;
    }
  | {
      status: 'complete';
      summary: SessionSummary;
      totalQuestions: number;
    };

export function useQuizSession() {
  const [state, setState] = useState<QuizState>({ status: 'loading' });
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const sessionQuery = useQuery({
    queryKey: ['quiz-session'],
    queryFn: quizApi.getSession,
    enabled: state.status === 'loading',
    retry: false,
  });

  if (state.status === 'loading' && sessionQuery.data) {
    if (sessionQuery.data.questions.length === 0) {
      setState({ status: 'empty' });
    } else {
      setState({
        status: 'ready',
        questions: sessionQuery.data.questions,
        currentIndex: 0,
        reviewCount: sessionQuery.data.review_count,
        newCount: sessionQuery.data.new_count,
      });
    }
  }

  const submitAnswer = useCallback(
    async (choiceId: string) => {
      if (state.status !== 'ready') return;

      const question = state.questions[state.currentIndex];
      const result = await quizApi.submitAnswer(question.id, choiceId);

      setAnsweredCount((c) => c + 1);
      if (result.is_correct) setCorrectCount((c) => c + 1);

      setState({
        status: 'feedback',
        questions: state.questions,
        currentIndex: state.currentIndex,
        result,
        selectedChoiceId: choiceId,
        reviewCount: state.reviewCount,
        newCount: state.newCount,
      });
    },
    [state],
  );

  const nextQuestion = useCallback(async () => {
    if (state.status !== 'feedback') return;

    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.questions.length) {
      const summary = await quizApi.completeSession(answeredCount, correctCount);
      setState({
        status: 'complete',
        summary,
        totalQuestions: state.questions.length,
      });
    } else {
      setState({
        status: 'ready',
        questions: state.questions,
        currentIndex: nextIndex,
        reviewCount: state.reviewCount,
        newCount: state.newCount,
      });
    }
  }, [state, answeredCount, correctCount]);

  const restart = useCallback(() => {
    setAnsweredCount(0);
    setCorrectCount(0);
    setState({ status: 'loading' });
  }, []);

  return {
    state,
    submitAnswer,
    nextQuestion,
    restart,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error,
  };
}
