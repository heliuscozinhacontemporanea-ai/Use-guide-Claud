import { cn } from '../../shared/utils/cn';

export interface RadioCardOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  disabled?: boolean;
}

interface RadioCardGroupProps<T extends string> {
  name: string;
  legend: string;
  hint?: string;
  options: RadioCardOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

/** Lista de opções em cartões com rádio nativo: teclado e leitor de tela funcionam sem código extra. */
export function RadioCardGroup<T extends string>({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
}: RadioCardGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-ink/70 mb-2">{legend}</legend>
      {hint && <p className="text-xs text-ink/70">{hint}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 min-h-11 p-3 rounded-2xl border transition-colors',
                checked ? 'border-accent-line bg-accent-soft' : 'border-line bg-surface',
                option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="mt-1 w-4 h-4 accent-teal-400 shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{option.title}</span>
                {option.description && (
                  <span className="block text-xs text-ink/70">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
