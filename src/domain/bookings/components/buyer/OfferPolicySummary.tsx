import { Clock, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PublicOffer } from '../../types/bookings';

/** Política de cancelamento exibida ANTES da compra (AGENTS.md §8.7). */
export function OfferPolicySummary({ offer }: { offer: PublicOffer }) {
  const { t } = useTranslation();
  const policy = offer.cancellationPolicy;
  const family = (offer.kind as string) === 'transfer' ? 'transfer' : 'booking';
  return (
    <ul className="space-y-1.5 text-xs text-white/70">
      {offer.durationMinutes ? (
        <li className="flex items-center gap-2">
          <Clock size={14} className="text-teal-300 shrink-0" aria-hidden="true" />
          {t('bookings.buyer.duration', { minutes: offer.durationMinutes })}
        </li>
      ) : null}
      {offer.meetingPoint ? (
        <li className="flex items-center gap-2">
          <MapPin size={14} className="text-teal-300 shrink-0" aria-hidden="true" />
          {t('bookings.buyer.meetingPoint', { address: offer.meetingPoint.address })}
        </li>
      ) : null}
      <li className="flex items-start gap-2">
        <ShieldCheck size={14} className="text-teal-300 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          <span className="font-semibold">
            {t(`salesPolicy.policies.${family}.${policy}.title`)}:
          </span>{' '}
          {t(`salesPolicy.policies.${family}.${policy}.description`)} {t('salesPolicy.noShow')}
        </span>
      </li>
    </ul>
  );
}
