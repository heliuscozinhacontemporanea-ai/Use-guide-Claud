import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import type { OpenFleetDaysPayload } from '../../types/bookings';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;

/** "Abrir dias" (F3b): datas, dias da semana e quantos veículos há em cada dia. */
export function FleetDaysForm({
  today,
  rental,
  onOpen,
}: {
  /** Hoje na hora do lugar ("AAAA-MM-DD"). */
  today: string;
  /** No aluguel, o horário de cada dia vem do anúncio. */
  rental: boolean;
  onOpen: (payload: OpenFleetDaysPayload) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [vehicles, setVehicles] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = Number.parseInt(vehicles, 10);

  const submit = async () => {
    if (!startDate || !endDate || endDate < startDate || weekdays.length === 0 || !(count >= 0)) {
      setError(t('fleet.days.invalidRange'));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onOpen({ startDate, endDate, weekdays, vehicles: count });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-3 rounded-2xl border border-line bg-surface p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h4 className="text-sm font-bold text-ink">{t('fleet.days.open')}</h4>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs text-ink/70">{t('fleet.days.from')}</span>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={INPUT}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-ink/70">{t('fleet.days.to')}</span>
          <input
            type="date"
            min={startDate}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={INPUT}
          />
        </label>
      </div>
      <fieldset>
        <legend className="mb-1 text-xs text-ink/70">{t('fleet.days.weekdays')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => {
            const on = weekdays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setWeekdays((current) =>
                    on ? current.filter((value) => value !== day) : [...current, day]
                  )
                }
                className={cn(
                  'press min-h-11 min-w-11 rounded-xl px-2 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50',
                  on ? 'bg-accent-soft text-accent' : 'bg-ink/[0.06] text-ink/70'
                )}
              >
                {t(`bookings.weekdays.${day}`)}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="block space-y-1">
        <span className="text-xs text-ink/70">{t('fleet.days.vehicles')}</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={vehicles}
          onChange={(event) => setVehicles(event.target.value)}
          className={INPUT}
        />
      </label>
      <p className="text-xs text-ink/70">{t('fleet.days.vehiclesHint')}</p>
      {rental ? <p className="text-xs text-ink/70">{t('fleet.days.rentalHoursHint')}</p> : null}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={submitting} className={BUTTON_PRIMARY}>
        {t('fleet.days.submit')}
      </button>
    </form>
  );
}
