import { useTranslation } from 'react-i18next';
import type { PublicOffer } from '../../types/bookings';
import { HOURLY_PRICE_OPTION_ID } from '../../utils/fleetSelection';
import { formatDuration } from '../../utils/formatDuration';
import { formatMinor } from '../../utils/money';

/** "08:00" do cadastro no formato de hora do idioma ativo (a hora já é a do lugar). */
function placeClock(hhmm: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`2000-01-01T${hhmm}:00.000Z`));
}

/**
 * Cartão da oferta por veículo (protótipo F3b, tela 4): o veículo ou o tipo de translado, os preços
 * por período, por hora ou por veículo, e quantas pessoas, onde retira e se exige CNH.
 */
export function FleetOfferSummary({
  offer,
}: {
  offer: PublicOffer & { kind: 'rental' | 'transfer' };
}) {
  const { t, i18n } = useTranslation();
  const money = (amountMinor: number) => formatMinor(amountMinor, i18n.language);
  const options = offer.pricing.priceOptions;
  const rental = offer.kind === 'rental';
  const tag = rental ? offer.vehicle : t('fleet.booking.privateTag');
  const custom = offer.fleet?.custom;
  const hourly = options.find((option) => option.id === HOURLY_PRICE_OPTION_ID);

  const lines = rental
    ? [
        ...(offer.fleet?.fixed ?? []).flatMap((period) => {
          const option = options.find((entry) => entry.id === period.id);
          return option
            ? [
                t('fleet.booking.periodLine', {
                  time: placeClock(period.start, i18n.language),
                  duration: formatDuration(period.minutes),
                  price: money(option.unitAmountMinor),
                }),
              ]
            : [];
        }),
        ...(custom?.mode === 'hours' && hourly
          ? [
              t('fleet.booking.hourlyLine', {
                count: custom.minHours,
                price: money(hourly.unitAmountMinor),
              }),
            ]
          : []),
      ]
    : options[0]
      ? [t('fleet.booking.vehicleLine', { price: money(options[0].unitAmountMinor) })]
      : [];

  const buyerAddress = offer.pickupMode === 'buyer_address';
  const details = [
    offer.groupMaxPeople === undefined
      ? null
      : t(rental ? 'fleet.booking.peopleUpTo' : 'fleet.booking.passengersUpTo', {
          count: offer.groupMaxPeople,
        }),
    rental
      ? t(buyerAddress ? 'fleet.booking.pickupDelivery' : 'fleet.booking.pickupStore')
      : t(buyerAddress ? 'fleet.booking.pickupAddress' : 'fleet.booking.pickupMeeting'),
    offer.requiresDriverLicense ? t('fleet.booking.needsLicense') : null,
  ].filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {tag && (
          <span className="px-2 py-0.5 rounded-full bg-accent-soft text-[12px] font-semibold text-ink">
            {tag}
          </span>
        )}
        {offer.route && (
          <span className="text-[14px] font-semibold text-ink">
            {t('fleet.booking.route', { from: offer.route.from, to: offer.route.to })}
          </span>
        )}
      </div>
      <p className="text-[13px] text-ink/70">{details.join(' · ')}</p>
      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <li key={line} className="py-2 first:pt-0 text-[15px] font-semibold text-ink">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
