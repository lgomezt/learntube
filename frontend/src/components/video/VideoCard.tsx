import type { Video } from '../../types';

interface VideoCardProps {
  video: Video;
  onDelete: (id: string) => void;
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const masteryColor =
    video.mastery_percentage >= 80
      ? 'text-brand-green'
      : video.mastery_percentage >= 40
        ? 'text-brand-gold'
        : 'text-brand-gray-300';

  return (
    <div className="flex gap-3 rounded-xl border border-brand-gray-200 bg-white p-3">
      <img
        src={video.thumbnail_url}
        alt={video.title}
        className="h-20 w-28 shrink-0 rounded-lg object-cover bg-brand-gray-200"
      />
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <p className="text-sm font-semibold leading-tight text-brand-gray-800 line-clamp-2">
          {video.title}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-brand-gray-300">
            {video.question_count} questions
          </span>
          <span className={`text-xs font-bold ${masteryColor}`}>
            {Math.round(video.mastery_percentage)}% mastered
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(video.id)}
        className="self-start shrink-0 rounded-lg p-1.5 text-brand-gray-300 hover:text-brand-red transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
