import { cn } from '../../shared/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Id do texto que descreve o interruptor (aria-labelledby). */
  labelledBy: string;
  describedBy?: string;
  disabled?: boolean;
}

/** Interruptor liga/desliga: área de toque de 48×44 px, cores do tema e foco visível. */
export function Switch({ checked, onChange, labelledBy, describedBy, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="press shrink-0 w-12 min-h-11 flex items-center justify-center rounded-full disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <span
        aria-hidden="true"
        className={cn(
          'w-11 h-[26px] rounded-full p-[3px] flex items-center transition-colors duration-200',
          checked ? 'bg-teal-500' : 'bg-ink/20'
        )}
      >
        <span
          className={cn(
            'w-5 h-5 rounded-full bg-[#ffffff] shadow-sm transition-transform duration-200 motion-reduce:transition-none',
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          )}
        />
      </span>
    </button>
  );
}
