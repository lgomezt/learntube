import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { useProgressOverview } from '../hooks/useProgress';
import { useVideos } from '../hooks/useVideos';

export function HomePage() {
  const navigate = useNavigate();
  const { data: overview } = useProgressOverview();
  const { data: videos } = useVideos();

  const hasVideos = videos && videos.length > 0;
  const streak = overview?.current_streak ?? 0;

  return (
    <div className="flex flex-col">
      <TopBar title="LearnTube" streak={streak} />

      <div className="flex flex-1 flex-col items-center px-4 pt-8">
        {/* Streak display */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-brand-gold/20">
            <span className="text-4xl">🔥</span>
          </div>
          <p className="text-3xl font-bold text-brand-gray-800">{streak}</p>
          <p className="text-sm text-brand-gray-300">
            {streak === 1 ? 'day streak' : 'day streak'}
          </p>
        </div>

        {hasVideos ? (
          <>
            {/* Stats summary */}
            {overview && (
              <div className="mb-8 flex w-full gap-3">
                <div className="flex-1 rounded-xl bg-brand-green/10 p-3 text-center">
                  <p className="text-lg font-bold text-brand-green">
                    {Math.round(overview.mastery_percentage)}%
                  </p>
                  <p className="text-xs text-brand-gray-300">Mastered</p>
                </div>
                <div className="flex-1 rounded-xl bg-brand-blue/10 p-3 text-center">
                  <p className="text-lg font-bold text-brand-blue">{overview.questions_seen}</p>
                  <p className="text-xs text-brand-gray-300">Seen</p>
                </div>
                <div className="flex-1 rounded-xl bg-brand-purple/10 p-3 text-center">
                  <p className="text-lg font-bold text-brand-purple">
                    {overview.total_questions}
                  </p>
                  <p className="text-xs text-brand-gray-300">Total</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => navigate('/quiz')}
              className="w-full rounded-xl bg-brand-green py-4 text-lg font-bold text-white shadow-md transition-all active:scale-[0.98] active:bg-brand-green-dark"
            >
              Start today's quiz
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="mb-2 text-base font-semibold text-brand-gray-800">
              Welcome to LearnTube!
            </p>
            <p className="mb-6 text-sm text-brand-gray-300">
              Add a YouTube video to start building your knowledge
            </p>
            <button
              onClick={() => navigate('/library/add')}
              className="rounded-xl bg-brand-green px-8 py-3.5 text-base font-bold text-white shadow-md transition-all active:scale-[0.98]"
            >
              Add your first video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
