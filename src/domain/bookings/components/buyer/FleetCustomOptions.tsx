import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { ListEmpty } from '../../../../ui/components/ListState';
import type { PublicFleetDay, PublicOffer } from '../../types/bookings';
import { formatSlotTime, placeInputToIso } from '../../utils/dates';
import { customStarts, maxHoursFrom } from '../../utils/fleetAvailability';
import {
  type FleetQuote,
  type FleetSelection,
  HOURLY_PRICE_OPTION_ID,
} from '../../utils/fleetSelection';
import { formatMinor } from '../../utils/money';
import { FLEET_OPTION, FLEET_OPTION_IDLE, FLEET_OPTION_SELECTED } from './FleetFixedOptions';
import { FleetStepper } from './FleetStepper';

/**
 * Horário personalizado (F3b): o aluguel escolhe a retirada e as horas; o translado, a hora da busca.
 * Horários riscados não têm veículo livre.
 */
export function FleetCustomOptions({
  offer,
  day,
  selection,
  quote,
  onChange,
}: {
  offer: Pick<PublicOffer, 'kind' | 'durationMinutes' | 'pricing' | 'timeZone'>;
  day: PublicFleetDay;
  selection: FleetSelection;
  quote: FleetQuote | null;
  onChange: (selection: FleetSelection) => void;
}) {
  const { t, i18n } = useTranslation();
  const timeZone = offer.timeZone;
  const time = (iso: string) => formatSlotTime(iso, i18n.language, timeZone);
  const starts = customStarts(offer, day, Date.now(), (date, hhmm) =>
    placeInputToIso(`${date}T${hhmm}`, timeZone)
  );
  const custom = day.custom;
  if (!custom || starts.length === 0) return <ListEmpty message={t('fleet.booking.noTimes')} />;
  const rental = custom.mode === 'hours';
  const hours = selection.hours ?? (rental ? custom.minHours : 0);
  const hourly = offer.pricing.priceOptions.find((option) => option.id === HOURLY_PRICE_OPTION_ID);

  return (
    <div className="space-y-3">
      <fieldset className="space-y-2">
        <legend className="text-[13px] font-semibold text-ink/80">
          {t(rental ? 'fleet.booking.pickupTime' : 'fleet.booking.pickupTimeTransfer')}
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {starts.map((start) => {
            const selected = start.startsAt === selection.startsAt;
            const label = time(start.startsAt);
            return (
              <button
                key={start.startsAt}
                type="button"
                disabled={start.free <= 0}
                aria-pressed={selected}
                aria-label={
                  start.free <= 0 ? `${label} · ${t('fleet.booking.soldOut')}` : undefined
                }
                onClick={() =>
                  onChange({
                    mode: 'custom',
                    startsAt: start.startsAt,
                    ...(rental ? { hours: custom.minHours } : {}),
                  })
                }
                className={cn(
                  FLEET_OPTION,
                  'text-center text-[14px] font-medium disabled:line-through',
                  selected ? FLEET_OPTION_SELECTED : FLEET_OPTION_IDLE
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>
      {rental && selection.startsAt && quote && (
        <>
          <FleetStepper
            label={t('fleet.booking.hours')}
            hint={t('fleet.booking.hoursHint', { min: custom.minHours, time: time(quote.endsAt) })}
            value={hours}
            display={t('bookings.buyer.durationHours', { hours })}
            min={custom.minHours}
            max={maxHoursFrom(day, selection.startsAt, custom.minHours)}
            onChange={(next) => onChange({ ...selection, hours: next })}
            lessLabel={t('fleet.booking.lessHours')}
            moreLabel={t('fleet.booking.moreHours')}
          />
          {hourly && (
            <p className="flex justify-between gap-3 px-1 text-[13px] text-ink/70">
              <span>
                {t('fleet.booking.hourlyCalc', {
                  hours,
                  price: formatMinor(hourly.unitAmountMinor, i18n.language),
                })}
              </span>
              <span className="text-ink">{formatMinor(quote.unitAmountMinor, i18n.language)}</span>
            </p>
          )}
        </>
      )}
      {!rental && quote && (
        <p className="text-[13px] text-ink/70">
          {t('fleet.booking.arrival', { time: time(quote.endsAt) })}
        </p>
      )}
    </div>
  );
}
