import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { INFO_NOTE_STRONG, InfoNote } from '../../../../ui/components/InfoNote';
import { INPUT } from '../../../../ui/styles/controls';
import type { OpenFleetDaysPayload } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { endOfNextMonth } from '../../utils/dates';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;

/**
 * Página "Abrir dias" (protótipo do horário personalizado, tela 2): datas, dias da semana e quantos
 * veículos há em cada dia. O "Abrir" fica na barra; as datas já vêm de hoje ao fim do mês seguinte.
 */
export function FleetDaysForm({
  today,
  rental,
  defaultVehicles = 1,
  registerSave,
  onOpen,
}: {
  /** Hoje na hora do lugar ("AAAA-MM-DD"). */
  today: string;
  /** No aluguel, o horário de cada dia vem do anúncio. */
  rental: boolean;
  /** Veículos do último dia aberto, para não digitar de novo. */
  defaultVehicles?: number;
  registerSave: (save: (() => void) | null) => void;
  onOpen: (payload: OpenFleetDaysPayload) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => endOfNextMonth(today));
  const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [vehicles, setVehicles] = useState(String(defaultVehicles));
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const count = Number.parseInt(vehicles, 10);

  const submit = async () => {
    if (submitting.current) return;
    if (!startDate || !endDate || endDate < startDate || weekdays.length === 0 || !(count >= 0)) {
      setError(t('fleet.days.invalidRange'));
      return;
    }
    setError(null);
    submitting.current = true;
    try {
      await onOpen({ startDate, endDate, weekdays, vehicles: count });
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      submitting.current = false;
    }
  };
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    registerSave(() => void submitRef.current());
    return () => registerSave(null);
  }, [registerSave]);

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {rental ? <p className="text-xs text-ink/70">{t('fleet.days.rentalHoursHint')}</p> : null}
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
                  on ? 'bg-partner-soft text-partner' : 'bg-ink/[0.06] text-ink/70'
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
      <InfoNote>
        <Trans
          i18nKey="fleet.days.vehiclesNote"
          count={Number.isFinite(count) ? count : 0}
          components={{ b: INFO_NOTE_STRONG }}
        />
      </InfoNote>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
