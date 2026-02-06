interface TopBarProps {
  title: string;
  streak?: number;
  onBack?: () => void;
}

export function TopBar({ title, streak, onBack }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-gray-800 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-brand-gray-800">{title}</h1>
      </div>
      {streak !== undefined && streak > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-brand-gold/20 px-3 py-1">
          <span className="text-sm">&#x1F525;</span>
          <span className="text-sm font-bold text-brand-gold">{streak}</span>
        </div>
      )}
    </header>
  );
}
