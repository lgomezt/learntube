import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { VideoList } from '../components/video/VideoList';
import { useVideos, useDeleteVideo } from '../hooks/useVideos';

export function LibraryPage() {
  const navigate = useNavigate();
  const { data: videos, isLoading } = useVideos();
  const deleteVideo = useDeleteVideo();

  const handleDelete = (id: string) => {
    if (confirm('Delete this video and all its questions?')) {
      deleteVideo.mutate(id);
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar title="Library" />

      <div className="px-4 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-brand-gray-300">
            {videos?.length ?? 0} video{(videos?.length ?? 0) !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => navigate('/library/add')}
            className="flex items-center gap-1.5 rounded-lg bg-brand-green px-3 py-2 text-sm font-bold text-white active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="h-8 w-8 animate-spin text-brand-green" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <VideoList videos={videos ?? []} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
