import { useTranslation } from 'react-i18next';
import { cn } from '../../../../../shared/utils/cn';
import type { FormState, OperatingDay } from '../../../types/partsForm';
import { SIGNUP_LABEL } from '../../sections/signupStyles';
import { TimeRangeField } from './TimeRangeField';

// Chaves gravadas no documento, de domingo a sábado.
const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;
const DEFAULT_DAY: OperatingDay = { open: '08:00', close: '22:00', closed: false };

/** Horário de cada dia da semana; o nome do dia vem do Intl no idioma ativo. */
export function OperatingHoursField({
  hours,
  onChange,
}: {
  hours: FormState['operatingHours'] | undefined;
  onChange: (next: FormState['operatingHours']) => void;
}) {
  const { t, i18n } = useTranslation();
  const a = (key: 'hours' | 'open' | 'closed' | 'opens' | 'closes') =>
    t(`partnerSignup.details.additional.${key}`);
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'long', timeZone: 'UTC' });
  const current = (hours ?? {}) as FormState['operatingHours'];
  const setDay = (day: string, patch: Partial<OperatingDay>) =>
    onChange({ ...current, [day]: { ...(current[day] ?? DEFAULT_DAY), ...patch } });

  return (
    <fieldset>
      <legend className={SIGNUP_LABEL}>{a('hours')}</legend>
      <ul className="rounded-2xl border border-line bg-surface divide-y divide-line">
        {DAYS.map((day, index) => {
          const value = current[day] ?? DEFAULT_DAY;
          // 1º de janeiro de 2023 foi um domingo.
          const name = weekday.format(Date.UTC(2023, 0, 1 + index));
          return (
            <li key={day} className="p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="px-1 text-[15px] font-medium text-ink first-letter:uppercase">
                  {name}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!value.closed}
                  aria-label={name}
                  onClick={() => setDay(day, { closed: !value.closed })}
                  className={cn(
                    'press min-h-11 px-3.5 rounded-xl border text-[14px] font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                    value.closed
                      ? 'bg-surface border-line text-ink/70'
                      : 'bg-partner-soft border-partner text-ink'
                  )}
                >
                  {value.closed ? a('closed') : a('open')}
                </button>
              </div>
              {value.closed ? null : (
                <TimeRangeField
                  id={`hours-${index}`}
                  fromLabel={a('opens')}
                  toLabel={a('closes')}
                  from={value.open || ''}
                  to={value.close || ''}
                  onFrom={(open) => setDay(day, { open })}
                  onTo={(close) => setDay(day, { close })}
                />
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
