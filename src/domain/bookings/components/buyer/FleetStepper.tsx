import { Minus, Plus } from 'lucide-react';
import { useId } from 'react';

const ROUND =
  'press grid place-items-center size-11 rounded-full border border-line text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed';

/** Linha com rótulo, dica e − valor + (horas do aluguel e veículos da reserva). */
export function FleetStepper({
  label,
  hint,
  value,
  display,
  min,
  max,
  onChange,
  lessLabel,
  moreLabel,
}: {
  label: string;
  hint?: string;
  value: number;
  /** Valor como aparece entre os botões (ex.: "3 h"). */
  display?: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
  lessLabel: string;
  moreLabel: string;
}) {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-line"
    >
      <div className="min-w-0">
        <p id={labelId} className="text-sm font-semibold text-ink">
          {label}
        </p>
        {hint && <p className="text-xs text-ink/70">{hint}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          aria-label={lessLabel}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={ROUND}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <output
          aria-live="polite"
          className="min-w-10 text-center text-[15px] font-semibold text-ink"
        >
          {display ?? value}
        </output>
        <button
          type="button"
          aria-label={moreLabel}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={ROUND}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
