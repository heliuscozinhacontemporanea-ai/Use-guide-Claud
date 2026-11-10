import { useTranslation } from 'react-i18next';
import type { PublicOffer } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { textFor } from './BookingOfferPanel';

/** Opções de preço da oferta, como o parceiro cadastrou: por pessoa ou por grupo (D20). */
export function OfferPriceOptions({ offer }: { offer: PublicOffer }) {
  const { t, i18n } = useTranslation();
  const group = offer.sellingUnit === 'group';
  return (
    <ul className="divide-y divide-line">
      {offer.pricing.priceOptions.map((option) => {
        const min = option.minQuantity ?? 1;
        const max = option.maxQuantity ?? offer.maxParticipantsPerBooking;
        const detail = group
          ? t('bookings.buyer.perGroup', { count: offer.groupMaxPeople ?? max })
          : max > min
            ? t('bookings.buyer.perPersonRange', { min, max })
            : t('bookings.buyer.perPerson');
        return (
          <li key={option.id} className="py-2.5 first:pt-0 flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-ink">
                {textFor(option.label, i18n.language)}
              </span>
              <span className="block text-[13px] text-ink/70">{detail}</span>
            </span>
            <span className="shrink-0 font-display text-[20px] font-bold text-ink">
              {formatMinor(option.unitAmountMinor, i18n.language)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
