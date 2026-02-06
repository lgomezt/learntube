import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { VideoInput } from '../components/video/VideoInput';
import { useAddVideo } from '../hooks/useVideos';

export function AddVideoPage() {
  const navigate = useNavigate();
  const addVideo = useAddVideo();

  const handleSubmit = (url: string) => {
    addVideo.mutate(url, {
      onSuccess: () => {
        navigate('/library');
      },
    });
  };

  const errorMessage = addVideo.error
    ? (addVideo.error as any)?.response?.data?.detail ?? 'Failed to add video. Please try again.'
    : null;

  return (
    <div className="flex flex-col">
      <TopBar title="Add Video" onBack={() => navigate('/library')} />

      <div className="px-4 pt-6">
        <p className="mb-6 text-sm text-brand-gray-300">
          Paste a YouTube video URL to extract its transcript and generate quiz questions.
        </p>

        <VideoInput
          onSubmit={handleSubmit}
          isLoading={addVideo.isPending}
          error={errorMessage}
        />
      </div>
    </div>
  );
}
