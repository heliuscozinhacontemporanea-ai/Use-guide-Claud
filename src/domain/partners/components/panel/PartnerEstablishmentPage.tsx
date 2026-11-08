import { Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { StatTile } from '../../../../ui/components/StatTile';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { useListingPlan } from '../../hooks/useListingPlan';
import { useListingVerification } from '../../hooks/useListingVerification';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerEstablishment } from '../../types/partnerHome';
import { formatPlanDate, listingPlanChipStatus } from '../../utils/listingPlanStatus';

/** Página do estabelecimento (p19): status e plano, números, ofertas e avaliações. */
export function PartnerEstablishmentPage({
  item,
  stats,
  onBack,
  onEdit,
  onOpenPlan,
  onVerify,
  onToggleActive,
  visits,
  offers,
  reviews,
}: {
  item: PartnerContentRecord;
  stats: PartnerEstablishment | undefined;
  onBack: () => void;
  onEdit: () => void;
  onOpenPlan: () => void;
  onVerify: () => void;
  onToggleActive: () => void;
  /** Cartão de visitas do mês (insights), montado pela composição. */
  visits: ReactNode;
  /** Passeios e aluguéis (bookings); nulo quando a categoria não vende. */
  offers: ReactNode | null;
  /** Avaliações recentes (reviews), montadas pela composição. */
  reviews: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const paused = item.isActive === false;
  const verification = useListingVerification(item.id);
  const verificationStatus = verification.data?.status ?? 'not_submitted';
  const verified = Boolean(item.isVerified) || verificationStatus === 'approved';
  const reviewCount = stats?.reviewCount ?? 0;
  const plan = useListingPlan(item.id);
  const planStatus = plan.data ? listingPlanChipStatus(plan.data) : 'none';
  const planDate = plan.data?.planUntil ? formatPlanDate(plan.data.planUntil, i18n.language) : '';
  const planLine =
    planStatus === 'active' && plan.data?.planType
      ? t('partnerCatalog.establishment.planActive', {
          plan: t(`listingPlan.planNames.${plan.data.planType}`).toLocaleLowerCase(i18n.language),
          date: planDate,
        })
      : t(`listingPlan.chip.${planStatus}`, { date: planDate });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BackButton label={t('partnerPanel.tabs.catalog')} onClick={onBack} />
        <h2 className="flex-1 min-w-0 text-[24px] font-display font-bold text-ink break-words">
          {item.name}
        </h2>
        <TextButton tone="accent" onClick={onEdit}>
          {t('partnerCatalog.establishment.edit')}
        </TextButton>
      </div>

      <section className="rounded-[20px] bg-surface border border-line p-4 space-y-1">
        <StatusText tone={paused ? 'warn' : 'success'}>
          {paused
            ? t('partnerCatalog.status.paused')
            : [
                t('partnerCatalog.status.published'),
                verified && t('partnerCatalog.status.verified'),
              ]
                .filter(Boolean)
                .join(' · ')}
        </StatusText>
        {!plan.loading && (
          <p
            className={`text-[14px] ${planStatus === 'suspended' ? 'text-danger' : 'text-ink/80'}`}
          >
            {planStatus === 'none' ? t('partnerCatalog.establishment.noPlan') : planLine}
          </p>
        )}
        <div className="flex flex-wrap gap-x-5 pt-1">
          {planStatus === 'none' && !plan.loading && (
            <TextButton tone="accent" onClick={onOpenPlan}>
              {t('partnerCatalog.establishment.seePlans')}
            </TextButton>
          )}
          {!verified && !verification.loading && (
            <TextButton
              tone={verificationStatus === 'rejected' ? 'warn' : 'accent'}
              onClick={onVerify}
            >
              {t(`verification.status.${verificationStatus}`)}
            </TextButton>
          )}
          <TextButton onClick={onToggleActive}>
            {t(
              paused ? 'partnerCatalog.establishment.resume' : 'partnerCatalog.establishment.pause'
            )}
          </TextButton>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {visits}
        <StatTile
          label={t('partnerCatalog.establishment.rating')}
          value={
            reviewCount > 0 && stats ? (
              <span className="inline-flex items-center gap-1.5">
                {stats.rating.toLocaleString(i18n.language, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                <Star size={20} className="fill-current" aria-hidden="true" />
              </span>
            ) : (
              '—'
            )
          }
          hint={
            reviewCount > 0
              ? t('partnerCatalog.establishment.reviews', { count: reviewCount })
              : t('partnerCatalog.establishment.noRating')
          }
        />
      </div>

      {offers && (
        <section className="space-y-3">
          <h3 className="px-1 text-[18px] font-display font-bold text-ink">
            {t('partnerCatalog.establishment.offers')}
          </h3>
          {offers}
        </section>
      )}

      <section className="space-y-3">
        <h3 className="px-1 text-[18px] font-display font-bold text-ink">
          {t('partnerCatalog.establishment.reviewsTitle')}
        </h3>
        {reviews}
      </section>
    </div>
  );
}
