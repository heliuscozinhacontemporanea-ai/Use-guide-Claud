import { useTranslation } from 'react-i18next';
import type { PublicOffer } from '../../types/bookings';

/** Política de cancelamento exibida ANTES da compra (AGENTS.md §8.7). */
export function OfferPolicySummary({ offer }: { offer: PublicOffer }) {
  const { t } = useTranslation();
  const policy = offer.cancellationPolicy;
  const family = (offer.kind as string) === 'transfer' ? 'transfer' : 'booking';
  return (
    <div className="space-y-1 text-[14px] text-ink/75">
      <p>
        <span className="font-semibold text-ink">
          {t(`salesPolicy.policies.${family}.${policy}.title`)}:
        </span>{' '}
        {t(`salesPolicy.policies.${family}.${policy}.description`)} {t('salesPolicy.noShow')}
      </p>
      {offer.meetingPoint && (
        <p>{t('bookings.buyer.meetingPoint', { address: offer.meetingPoint.address })}</p>
      )}
    </div>
  );
}
