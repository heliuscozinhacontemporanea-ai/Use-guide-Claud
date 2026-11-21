import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

/** Meio-dia em UTC: o nome do dia de uma data do calendário não muda com o fuso de quem vê. */
function calendarDate(date: string): Date {
  return new Date(`${date}T12:00:00.000Z`);
}

/** Dias da reserva por veículo (protótipo F3b): dia da semana curto e o número do dia. */
export function FleetDayChips({
  dates,
  selected,
  onSelect,
}: {
  dates: string[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'short', timeZone: 'UTC' });
  const full = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
  return (
    <fieldset>
      <legend className="sr-only">{t('fleet.booking.days')}</legend>
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 snap-x">
        {dates.map((date) => {
          const isSelected = date === selected;
          return (
            <button
              key={date}
              type="button"
              aria-pressed={isSelected}
              aria-label={full.format(calendarDate(date))}
              onClick={() => onSelect(date)}
              className={cn(
                'press snap-start shrink-0 w-14 min-h-14 py-1.5 rounded-xl border flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                isSelected ? 'bg-ink text-app border-ink' : 'bg-surface border-line text-ink'
              )}
            >
              <span
                className={cn('text-[12px]', isSelected ? 'text-app/80' : 'text-ink/70')}
                aria-hidden="true"
              >
                {weekday.format(calendarDate(date))}
              </span>
              <span className="text-[18px] font-bold leading-tight" aria-hidden="true">
                {Number(date.slice(8, 10))}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
