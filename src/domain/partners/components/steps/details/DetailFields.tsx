import { useTranslation } from 'react-i18next';
import type { DetailOptionKey } from '../../../../../shared/i18n/partnerSignupDetailsResources';
import { cn } from '../../../../../shared/utils/cn';
import {
  SIGNUP_ERROR,
  SIGNUP_INPUT,
  SIGNUP_LABEL,
  SIGNUP_TEXTAREA,
} from '../../sections/signupStyles';

const CHOICE =
  'press min-h-11 rounded-xl border font-medium flex items-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
const CHOICE_ON = 'bg-partner-soft border-partner text-ink';
const CHOICE_OFF = 'bg-surface border-line text-ink/80';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={SIGNUP_ERROR}>{message}</p>;
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'url';
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
  /** Texto fixo antes do valor, como o símbolo da moeda. */
  prefix?: string;
}

/** Campo de texto dos detalhes do cadastro (V2). `required` só valida; o rótulo não leva asterisco. */
export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = 'text',
  multiline,
  maxLength = 300,
  error,
  prefix,
}: TextFieldProps) {
  const className = cn(
    multiline ? SIGNUP_TEXTAREA : SIGNUP_INPUT,
    prefix && 'pl-11',
    error && 'border-danger-line'
  );
  return (
    <div>
      <label htmlFor={id} className={SIGNUP_LABEL}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          aria-invalid={Boolean(error)}
          className={className}
        />
      ) : (
        <div className="relative">
          {prefix ? (
            <span
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink/70"
            >
              {prefix}
            </span>
          ) : null}
          <input
            id={id}
            type="text"
            inputMode={inputMode}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-invalid={Boolean(error)}
            className={className}
          />
        </div>
      )}
      <FieldError message={error} />
    </div>
  );
}

/** Opções de uma lista: chave da tradução → texto gravado (em português, débito registrado). */
export type DetailOptions = Partial<Record<DetailOptionKey, string>>;

interface ChipGroupProps {
  label: string;
  options: DetailOptions;
  selected: string[];
  onToggle: (value: string) => void;
  hint?: string;
  required?: boolean;
  error?: string;
}

/** Opções que se marcam tocando (comodidades, o que está incluído). */
export function ChipGroup({ label, options, selected, onToggle, hint, error }: ChipGroupProps) {
  const { t } = useTranslation();
  return (
    <fieldset>
      <legend className={SIGNUP_LABEL}>{label}</legend>
      {hint ? <p className="-mt-0.5 mb-2 px-1 text-[13px] text-ink/70">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(options) as [DetailOptionKey, string][]).map(([key, value]) => {
          const on = selected.includes(value);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(value)}
              className={cn(CHOICE, 'px-3.5 text-[14px]', on ? CHOICE_ON : CHOICE_OFF)}
            >
              {t(`partnerSignup.details.options.${key}`)}
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

interface YesNoFieldProps {
  label: string;
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  /** Respostas longas ficam uma embaixo da outra. */
  stacked?: boolean;
  error?: string;
}

export function YesNoField({
  label,
  value,
  onChange,
  yesLabel,
  noLabel,
  stacked,
  error,
}: YesNoFieldProps) {
  const { t } = useTranslation();
  const answers = [
    { option: true, text: yesLabel ?? t('partnerSignup.yes') },
    { option: false, text: noLabel ?? t('partnerSignup.no') },
  ];
  return (
    <fieldset>
      <legend className={SIGNUP_LABEL}>{label}</legend>
      <div className={cn('flex gap-2', stacked && 'flex-col')}>
        {answers.map(({ option, text }) => (
          <button
            key={String(option)}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              CHOICE,
              'flex-1 px-4 text-[15px]',
              stacked ? 'text-left' : 'justify-center',
              value === option ? CHOICE_ON : CHOICE_OFF
            )}
          >
            {text}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
