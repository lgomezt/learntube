import type { SessionSummary } from '../../types';

interface ResultScreenProps {
  summary: SessionSummary;
  totalQuestions: number;
  onRestart: () => void;
  onHome: () => void;
}

export function ResultScreen({ summary, totalQuestions, onRestart, onHome }: ResultScreenProps) {
  const pct = summary.accuracy;
  const isGreat = pct >= 80;
  const isOk = pct >= 50;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="mb-6 text-6xl">
        {isGreat ? '🎉' : isOk ? '💪' : '📚'}
      </div>

      <h2 className="mb-2 text-2xl font-bold text-brand-gray-800">
        {isGreat ? 'Awesome!' : isOk ? 'Good effort!' : 'Keep practicing!'}
      </h2>

      <p className="mb-8 text-brand-gray-300">
        You completed today's session
      </p>

      <div className="mb-8 grid w-full max-w-xs grid-cols-2 gap-4">
        <div className="rounded-xl bg-brand-green/10 p-4 text-center">
          <p className="text-2xl font-bold text-brand-green">
            {summary.questions_correct}/{totalQuestions}
          </p>
          <p className="text-xs text-brand-gray-300 mt-1">Correct</p>
        </div>
        <div className="rounded-xl bg-brand-blue/10 p-4 text-center">
          <p className="text-2xl font-bold text-brand-blue">{Math.round(pct)}%</p>
          <p className="text-xs text-brand-gray-300 mt-1">Accuracy</p>
        </div>
        <div className="rounded-xl bg-brand-gold/10 p-4 text-center">
          <p className="text-2xl font-bold text-brand-gold">{summary.streak}</p>
          <p className="text-xs text-brand-gray-300 mt-1">Day streak</p>
        </div>
        <div className="rounded-xl bg-brand-purple/10 p-4 text-center">
          <p className="text-2xl font-bold text-brand-purple">{summary.questions_answered}</p>
          <p className="text-xs text-brand-gray-300 mt-1">Answered</p>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={onRestart}
          className="w-full rounded-xl bg-brand-green py-3.5 text-base font-bold text-white shadow-sm transition-all active:scale-[0.98]"
        >
          Practice again
        </button>
        <button
          onClick={onHome}
          className="w-full rounded-xl border-2 border-brand-gray-200 bg-white py-3.5 text-base font-bold text-brand-gray-800 transition-all active:scale-[0.98]"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
