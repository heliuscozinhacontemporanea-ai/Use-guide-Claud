import { useTranslation } from 'react-i18next';
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
import { FleetStartGrid } from './FleetStartGrid';
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
      <FleetStartGrid
        legend={t(rental ? 'fleet.booking.pickupTime' : 'fleet.booking.pickupTimeTransfer')}
        starts={starts}
        selectedStartsAt={selection.startsAt}
        timeZone={timeZone}
        onSelect={(startsAt) =>
          onChange({ mode: 'custom', startsAt, ...(rental ? { hours: custom.minHours } : {}) })
        }
      />
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
      {!rental && (quote || starts.some((start) => start.free <= 0)) && (
        <p className="text-[13px] text-ink/70">
          {quote && <span>{t('fleet.booking.arrival', { time: time(quote.endsAt) })} </span>}
          {starts.some((start) => start.free <= 0) && (
            <span>{t('fleet.booking.crossedTransfer')}</span>
          )}
        </p>
      )}
    </div>
  );
}
