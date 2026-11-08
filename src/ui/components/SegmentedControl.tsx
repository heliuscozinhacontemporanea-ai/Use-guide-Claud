import { cn } from '../../shared/utils/cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Abas em pílula (D17): a ativa fica invertida, sem cor de destaque. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex p-1 rounded-full bg-ink/[0.06]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'press flex-1 min-h-11 px-3 rounded-full text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
            value === option.value ? 'bg-ink text-app' : 'text-ink/70 hover:text-ink'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
