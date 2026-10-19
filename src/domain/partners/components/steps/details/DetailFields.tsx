import { cn } from '../../../../../shared/utils/cn';

const LABEL = 'text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 block';
const INPUT =
  'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">{message}</p>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = 'text',
  required,
  multiline,
  maxLength = 300,
  error,
}: TextFieldProps) {
  const className = cn(
    INPUT,
    error ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10'
  );
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className={className}
        />
      ) : (
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
        />
      )}
      <FieldError message={error} />
    </div>
  );
}

interface ChipGroupProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function ChipGroup({ label, options, selected, onToggle, required, error }: ChipGroupProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selected.includes(option)}
            onClick={() => onToggle(option)}
            className={cn(
              'min-h-[44px] px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400/50',
              selected.includes(option)
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

interface YesNoFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  return (
    <fieldset className="space-y-3">
      <legend className={LABEL}>{label}</legend>
      <div className="flex gap-2">
        {([true, false] as const).map((option) => (
          <button
            key={String(option)}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              'flex-1 min-h-[44px] rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50',
              value === option
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            )}
          >
            {option ? 'Sim' : 'Não'}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
