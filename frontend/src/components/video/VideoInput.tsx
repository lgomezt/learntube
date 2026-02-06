import { useState } from 'react';

interface VideoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function VideoInput({ onSubmit, isLoading, error }: VideoInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-gray-800">
          YouTube URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full rounded-xl border-2 border-brand-gray-200 px-4 py-3 text-base text-brand-gray-800 placeholder:text-brand-gray-300 focus:border-brand-blue focus:outline-none"
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-brand-red/10 px-3 py-2 text-sm text-brand-red">{error}</p>
      )}

      <button
        type="submit"
        disabled={!url.trim() || isLoading}
        className="w-full rounded-xl bg-brand-green py-3.5 text-base font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing video...
          </span>
        ) : (
          'Add Video'
        )}
      </button>

      {isLoading && (
        <p className="text-center text-sm text-brand-gray-300">
          Fetching transcript and generating questions. This may take a moment.
        </p>
      )}
    </form>
  );
}
