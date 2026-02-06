import { useState } from 'react';
import type { Question, AnswerResult } from '../../types';
import { AnswerButton } from './AnswerButton';

interface QuizCardProps {
  question: Question;
  onSubmit: (choiceId: string) => Promise<void>;
  feedback: { result: AnswerResult; selectedChoiceId: string } | null;
  onNext: () => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

export function QuizCard({ question, onSubmit, feedback, onNext }: QuizCardProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (choiceId: string) => {
    if (feedback || submitting) return;
    setSubmitting(true);
    await onSubmit(choiceId);
    setSubmitting(false);
  };

  const getState = (choiceId: string) => {
    if (!feedback) return 'idle' as const;
    if (choiceId === feedback.selectedChoiceId) {
      return feedback.result.is_correct ? ('correct' as const) : ('incorrect' as const);
    }
    if (choiceId === feedback.result.correct_choice_id) {
      return 'reveal' as const;
    }
    return 'idle' as const;
  };

  return (
    <div className="flex flex-1 flex-col px-4">
      <div className="mb-6 mt-4">
        <p className="text-lg font-semibold leading-snug text-brand-gray-800">
          {question.question_text}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {question.choices.map((choice, i) => (
          <AnswerButton
            key={choice.id}
            label={LABELS[i]}
            text={choice.text}
            selected={feedback?.selectedChoiceId === choice.id}
            state={getState(choice.id)}
            disabled={!!feedback}
            onClick={() => handleSelect(choice.id)}
          />
        ))}
      </div>

      {feedback && (
        <div className="mt-6 flex flex-col gap-4">
          <div
            className={`rounded-xl p-4 ${
              feedback.result.is_correct
                ? 'bg-brand-green/10 text-brand-green-dark'
                : 'bg-brand-red/10 text-brand-red'
            }`}
          >
            <p className="text-sm font-bold mb-1">
              {feedback.result.is_correct ? 'Correct!' : 'Not quite'}
            </p>
            <p className="text-sm leading-relaxed">{feedback.result.explanation}</p>
          </div>

          <button
            onClick={onNext}
            className="w-full rounded-xl bg-brand-green py-3.5 text-base font-bold text-white shadow-sm transition-all active:scale-[0.98] active:bg-brand-green-dark"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
