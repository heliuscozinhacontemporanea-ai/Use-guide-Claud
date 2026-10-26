import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AdminForceMajeureReview } from '../../types/adminFinance';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { CARD, DANGER_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from './adminFinanceStyles';
import { SellerLine } from './SellerLine';

export function ForceMajeureReviewCard({
  review,
  busy,
  onOpenProof,
  onDecide,
}: {
  review: AdminForceMajeureReview;
  busy: boolean;
  onOpenProof: (review: AdminForceMajeureReview) => void;
  onDecide: (review: AdminForceMajeureReview, approve: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink">
            {t(`receivables.debts.reason.${review.reason}`)}
          </p>
          <SellerLine seller={review} />
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-bold bg-info-soft text-info border-info-line">
          {formatMoneyMinor(review.remainingMinor, i18n.language)}
        </span>
      </div>
      <blockquote className="px-3 py-2 rounded-xl bg-app/40 border-l-2 border-line text-xs text-ink/80 whitespace-pre-line break-words">
        {review.forceMajeureReason}
      </blockquote>
      <p className="text-[11px] text-ink/70">
        {t('adminFinance.forceMajeure.declaredAt', {
          date: formatFortalezaDateTime(review.declaredAt, i18n.language),
        })}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onOpenProof(review)}
          className={`${SECONDARY_BUTTON} flex items-center gap-1.5`}
        >
          <FileText size={14} aria-hidden="true" />
          {t('adminFinance.forceMajeure.openProof')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide(review, true)}
          className={PRIMARY_BUTTON}
        >
          {t('adminFinance.forceMajeure.approve')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide(review, false)}
          className={DANGER_BUTTON}
        >
          {t('adminFinance.forceMajeure.reject')}
        </button>
      </div>
    </li>
  );
}
