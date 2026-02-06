import clsx from 'clsx';

interface AnswerButtonProps {
  label: string;
  text: string;
  selected: boolean;
  state: 'idle' | 'correct' | 'incorrect' | 'reveal';
  disabled: boolean;
  onClick: () => void;
}

export function AnswerButton({
  label,
  text,
  selected,
  state,
  disabled,
  onClick,
}: AnswerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.98]',
        state === 'idle' && 'border-brand-gray-200 bg-white text-brand-gray-800',
        state === 'idle' && selected && 'border-brand-blue bg-brand-blue/5',
        state === 'correct' && 'border-brand-green bg-brand-green/10 text-brand-green-dark',
        state === 'incorrect' && 'border-brand-red bg-brand-red/10 text-brand-red',
        state === 'reveal' && 'border-brand-green bg-brand-green/10 text-brand-green-dark',
        disabled && state === 'idle' && 'opacity-50',
      )}
    >
      <span
        className={clsx(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          state === 'idle' && 'bg-brand-gray-200 text-brand-gray-800',
          state === 'correct' && 'bg-brand-green text-white',
          state === 'incorrect' && 'bg-brand-red text-white',
          state === 'reveal' && 'bg-brand-green text-white',
        )}
      >
        {state === 'correct' ? '✓' : state === 'incorrect' ? '✗' : label}
      </span>
      <span className="text-base font-medium leading-snug pt-0.5">{text}</span>
    </button>
  );
}
