import { TopBar } from '../components/layout/TopBar';
import { StatsOverview } from '../components/progress/StatsOverview';
import { StreakCalendar } from '../components/progress/StreakCalendar';
import { useProgressOverview, useStreak } from '../hooks/useProgress';

export function ProgressPage() {
  const { data: overview, isLoading: overviewLoading } = useProgressOverview();
  const { data: streak, isLoading: streakLoading } = useStreak();

  const isLoading = overviewLoading || streakLoading;

  return (
    <div className="flex flex-col">
      <TopBar title="Progress" streak={streak?.current_streak} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-brand-green" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
          {/* Streak highlight */}
          {streak && (
            <div className="flex items-center gap-4 rounded-xl bg-brand-gold/10 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/20">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-gray-800">
                  {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-brand-gray-300">
                  Longest: {streak.longest_streak} day{streak.longest_streak !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {/* Stats grid */}
          {overview && <StatsOverview data={overview} />}

          {/* Calendar */}
          {streak && <StreakCalendar days={streak.calendar} />}
        </div>
      )}
    </div>
  );
}
