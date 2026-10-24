import { useTranslation } from 'react-i18next';
import type { ListingPlanView } from '../../types/listingPlan';
import { formatPlanDate } from '../../utils/listingPlanStatus';

export function ListingPlanStatus({ view }: { view: ListingPlanView }) {
  const { t, i18n } = useTranslation();

  if (!view.planActive || !view.planType) {
    return <p className="text-sm text-white/80">{t('listingPlan.status.none')}</p>;
  }

  const sealMessage = view.sealSuspended
    ? t('listingPlan.status.sealSuspended')
    : view.seal.isVerified
      ? t('listingPlan.status.sealOn')
      : t('listingPlan.status.sealPendingVerification');

  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
      <p className="text-sm font-semibold text-white">
        {view.planType === 'admin'
          ? t('listingPlan.status.adminGranted')
          : t('listingPlan.status.activeUntil', {
              plan: t(`listingPlan.planNames.${view.planType}`),
              date: view.planUntil ? formatPlanDate(view.planUntil, i18n.language) : '',
            })}
      </p>
      <p
        className={
          view.sealSuspended || !view.seal.isVerified
            ? 'text-xs text-amber-200'
            : 'text-xs text-white/70'
        }
      >
        {sealMessage}
      </p>
    </div>
  );
}
