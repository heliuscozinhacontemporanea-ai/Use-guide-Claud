import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AdminSaleClaim } from '../../types/adminFinance';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { CARD, PRIMARY_BUTTON } from './adminFinanceStyles';
import { SellerLine } from './SellerLine';

export function SaleClaimQueueCard({
  claim,
  onDecide,
}: {
  claim: AdminSaleClaim;
  onDecide: (claim: AdminSaleClaim) => void;
}) {
  const { t, i18n } = useTranslation();
  const date = (iso: string) => formatFortalezaDateTime(iso, i18n.language);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  const pending = claim.status === 'refund_pending';
  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink break-words">
            {claim.title ?? t(`adminFinance.claims.fallbackTitle.${claim.referenceType}`)}
          </p>
          <SellerLine seller={claim} />
        </div>
        <span
          className={`shrink-0 max-w-[45%] px-2.5 py-1 rounded-full border text-[11px] font-bold text-center ${
            pending
              ? 'bg-info-soft text-info border-info-line'
              : 'bg-warn-soft text-warn border-warn-line'
          }`}
        >
          {t(pending ? 'adminFinance.claims.refundPending' : 'adminFinance.claims.open')}
        </span>
      </div>
      <p className="text-xs font-bold text-ink">{t(`saleClaims.reason.${claim.reason}`)}</p>
      {claim.details && (
        <blockquote className="px-3 py-2 rounded-xl bg-app/40 border-l-2 border-line text-xs text-ink/80 whitespace-pre-line break-words">
          {claim.details}
        </blockquote>
      )}
      <dl className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('adminFinance.claims.paid')}</dt>
          <dd className="text-ink">{money(claim.grossMinor)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('adminFinance.claims.refundable')}</dt>
          <dd className="font-bold text-ink">{money(claim.refundableMinor)}</dd>
        </div>
        {claim.serviceEndsAt && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/70">{t('adminFinance.claims.serviceEnd')}</dt>
            <dd className="text-ink">{date(claim.serviceEndsAt)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('adminFinance.claims.openedAt')}</dt>
          <dd className="text-ink">{date(claim.openedAt)}</dd>
        </div>
      </dl>
      {pending ? (
        <p className="text-[11px] text-ink/70">{t('adminFinance.claims.refundPendingHint')}</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-warn">
            {t('adminFinance.claims.decideBy', { date: date(claim.decideBy) })}
          </p>
          <button type="button" onClick={() => onDecide(claim)} className={PRIMARY_BUTTON}>
            {t('adminFinance.claims.decide')}
          </button>
        </div>
      )}
    </li>
  );
}
