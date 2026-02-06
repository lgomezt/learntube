interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between text-xs text-brand-gray-300 mb-1.5">
        <span>
          {current} / {total}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-gray-200">
        <div
          className="h-full rounded-full bg-brand-green transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
