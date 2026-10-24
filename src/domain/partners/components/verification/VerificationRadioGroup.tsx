import { cn } from '../../../../shared/utils/cn';

interface VerificationRadioGroupProps<T extends string> {
  legend: string;
  name: string;
  value: T | '';
  options: Array<{ value: T; label: string }>;
  error?: string;
  onChange: (value: T) => void;
}

export function VerificationRadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  error,
  onChange,
}: VerificationRadioGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-white/80 mb-2">{legend}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50',
              value === option.value
                ? 'border-accent-line bg-accent-soft text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="accent-teal-400"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </fieldset>
  );
}
