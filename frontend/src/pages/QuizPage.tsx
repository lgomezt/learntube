import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { QuizCard } from '../components/quiz/QuizCard';
import { ResultScreen } from '../components/quiz/ResultScreen';
import { useQuizSession } from '../hooks/useQuizSession';

export function QuizPage() {
  const navigate = useNavigate();
  const { state, submitAnswer, nextQuestion, restart, isLoading, error } = useQuizSession();

  if (isLoading || state.status === 'loading') {
    return (
      <div className="flex flex-col">
        <TopBar title="Quiz" onBack={() => navigate('/')} />
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <svg className="h-8 w-8 animate-spin text-brand-green" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-brand-gray-300">Building your session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || state.status === 'empty') {
    return (
      <div className="flex flex-col">
        <TopBar title="Quiz" onBack={() => navigate('/')} />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-base font-semibold text-brand-gray-800">
            {error ? 'Something went wrong' : 'No questions available'}
          </p>
          <p className="mt-1 text-sm text-brand-gray-300">
            {error ? 'Please try again later' : 'Add some videos first to start quizzing'}
          </p>
          <button
            onClick={() => navigate(error ? '/quiz' : '/library/add')}
            className="mt-6 rounded-xl bg-brand-green px-8 py-3 text-base font-bold text-white active:scale-[0.98]"
          >
            {error ? 'Retry' : 'Add a video'}
          </button>
        </div>
      </div>
    );
  }

  if (state.status === 'complete') {
    return (
      <div className="flex flex-col">
        <TopBar title="Results" />
        <ResultScreen
          summary={state.summary}
          totalQuestions={state.totalQuestions}
          onRestart={restart}
          onHome={() => navigate('/')}
        />
      </div>
    );
  }

  const { questions, currentIndex } = state;
  const currentQuestion = questions[currentIndex];
  const feedback =
    state.status === 'feedback'
      ? { result: state.result, selectedChoiceId: state.selectedChoiceId }
      : null;

  return (
    <div className="flex flex-col">
      <TopBar title="Quiz" onBack={() => navigate('/')} />
      <ProgressBar current={currentIndex + (feedback ? 1 : 0)} total={questions.length} />
      <QuizCard
        key={currentQuestion.id}
        question={currentQuestion}
        onSubmit={submitAnswer}
        feedback={feedback}
        onNext={nextQuestion}
      />
    </div>
  );
}
