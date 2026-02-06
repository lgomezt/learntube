import type { DailyStats } from '../../types';
import clsx from 'clsx';

interface StreakCalendarProps {
  days: DailyStats[];
}

export function StreakCalendar({ days }: StreakCalendarProps) {
  const today = new Date();
  const cells: { date: string; active: boolean; accuracy: number }[] = [];

  // Build last 30 days
  const statsMap = new Map(days.map((d) => [d.date, d]));
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const stat = statsMap.get(dateStr);
    cells.push({
      date: dateStr,
      active: !!stat && stat.questions_answered > 0,
      accuracy: stat?.accuracy ?? 0,
    });
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-brand-gray-800">Last 30 days</h3>
      <div className="grid grid-cols-10 gap-1.5">
        {cells.map((cell) => (
          <div
            key={cell.date}
            className={clsx(
              'aspect-square rounded-sm',
              cell.active
                ? cell.accuracy >= 80
                  ? 'bg-brand-green'
                  : cell.accuracy >= 50
                    ? 'bg-brand-green/60'
                    : 'bg-brand-green/30'
                : 'bg-brand-gray-200',
            )}
            title={`${cell.date}: ${cell.active ? `${cell.accuracy}% accuracy` : 'No activity'}`}
          />
        ))}
      </div>
    </div>
  );
}
