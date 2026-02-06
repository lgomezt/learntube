import type { Video } from '../../types';
import { VideoCard } from './VideoCard';

interface VideoListProps {
  videos: Video[];
  onDelete: (id: string) => void;
}

export function VideoList({ videos, onDelete }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-4xl">📚</div>
        <p className="text-base font-semibold text-brand-gray-800">No videos yet</p>
        <p className="mt-1 text-sm text-brand-gray-300">
          Add a YouTube video to start learning
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onDelete={onDelete} />
      ))}
    </div>
  );
}
