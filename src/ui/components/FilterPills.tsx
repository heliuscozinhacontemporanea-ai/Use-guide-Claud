import { Check } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export interface FilterPill<T extends string> {
  value: T;
  label: string;
}

/**
 * Pílulas de filtro (D37): fileira que rola de lado; a escolhida fica com o tom de ação e o ✓.
 * Toque de 44 px (P5 `rounded-full`).
 */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<FilterPill<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'press shrink-0 inline-flex items-center gap-2 min-h-11 px-4 rounded-full border text-control font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
              selected
                ? 'bg-accent-soft border-accent-line text-accent'
                : 'bg-surface border-line text-ink'
            )}
          >
            {selected && <Check size={16} aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
