import type { ProgressOverview } from '../../types';

interface StatsOverviewProps {
  data: ProgressOverview;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const totalAnswered = data.total_correct + data.total_incorrect;
  const accuracy = totalAnswered > 0 ? Math.round((data.total_correct / totalAnswered) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-brand-green/10 p-4">
        <p className="text-2xl font-bold text-brand-green">{data.total_videos}</p>
        <p className="text-xs text-brand-gray-300 mt-1">Videos</p>
      </div>
      <div className="rounded-xl bg-brand-blue/10 p-4">
        <p className="text-2xl font-bold text-brand-blue">{data.total_questions}</p>
        <p className="text-xs text-brand-gray-300 mt-1">Questions</p>
      </div>
      <div className="rounded-xl bg-brand-purple/10 p-4">
        <p className="text-2xl font-bold text-brand-purple">{Math.round(data.mastery_percentage)}%</p>
        <p className="text-xs text-brand-gray-300 mt-1">Mastered</p>
      </div>
      <div className="rounded-xl bg-brand-gold/10 p-4">
        <p className="text-2xl font-bold text-brand-gold">{accuracy}%</p>
        <p className="text-xs text-brand-gray-300 mt-1">Accuracy</p>
      </div>
    </div>
  );
}
