import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { TextButton } from '../../../../ui/components/TextButton';
import type { AdminForceMajeureReview } from '../../types/adminFinance';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';

/** Detalhes da força maior declarada e a decisão do admin (D16, 3A). */
export function ForceMajeureSheet({
  review,
  busy,
  onClose,
  onOpenProof,
  onDecide,
}: {
  review: AdminForceMajeureReview | null;
  busy: boolean;
  onClose: () => void;
  onOpenProof: (review: AdminForceMajeureReview) => void;
  onDecide: (review: AdminForceMajeureReview, approve: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <Dialog
      open={review !== null}
      onOpenChange={(open) => !open && onClose()}
      title={review ? t(`adminFinance.debts.reason.${review.reason}`) : ''}
      description={
        review
          ? [review.sellerName ?? t('adminFinance.unknownSeller'), review.maskedDocument]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
    >
      {review && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-2">
            <p className="text-sm text-ink/80 whitespace-pre-line break-words">
              “{review.forceMajeureReason}”
            </p>
            <p className="text-[12px] text-ink/60">
              {t('adminFinance.forceMajeure.meta', {
                date: formatBusinessDay(review.declaredAt, i18n.language),
                amount: formatMoneyMinor(review.remainingMinor, i18n.language),
              })}
            </p>
          </div>
          <TextButton onClick={() => onOpenProof(review)}>
            <FileText size={16} aria-hidden="true" />
            {t('adminFinance.forceMajeure.openProof')}
          </TextButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecide(review, true)}
            className={`${BUTTON_PRIMARY} w-full min-h-12 text-[15px]`}
          >
            {t('adminFinance.forceMajeure.approve')}
          </button>
          <div className="flex justify-center">
            <TextButton tone="danger" disabled={busy} onClick={() => onDecide(review, false)}>
              {t('adminFinance.forceMajeure.reject')}
            </TextButton>
          </div>
        </div>
      )}
    </Dialog>
  );
}
