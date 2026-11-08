import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PartnerReview } from '../../types/report';
import { PendingReviewCard } from './PendingReviewCard';

const PENDING_PREVIEW_COUNT = 3;

interface PendingReviewsPanelProps {
  reviews: PartnerReview[];
  onReplied: (reviewId: string, response: string) => void;
  /** Total contado no servidor; sem ele, conta só as avaliações carregadas. */
  pendingTotal?: number;
}

export function PendingReviewsPanel({
  reviews,
  onReplied,
  pendingTotal,
}: PendingReviewsPanelProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const pending = reviews.filter((review) => !review.partnerResponse);
  const visible = showAll ? pending : pending.slice(0, PENDING_PREVIEW_COUNT);

  return (
    <div className="glassmorphism rounded-[2rem] p-8 border border-line">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h4 className="text-sm font-semibold text-ink tracking-wide">
            {t('insights.reviews.title')}
          </h4>
          <p className="text-[10px] text-ink/70 font-medium tracking-wide">
            {t('insights.reviews.waiting', { count: pendingTotal ?? pending.length })}
          </p>
        </div>
        {pending.length > PENDING_PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
            className="px-4 py-2 min-h-[44px] rounded-xl bg-surface border border-line text-[9px] font-semibold tracking-wide text-ink/70 hover:text-ink hover:bg-ink/[0.06] transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {showAll ? t('insights.reviews.showLess') : t('insights.reviews.showAll')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {visible.length > 0 ? (
          visible.map((review) => (
            <PendingReviewCard key={review.id} review={review} onReplied={onReplied} />
          ))
        ) : (
          <div className="py-10 text-center border border-dashed border-line rounded-2xl">
            <p className="text-[11px] text-ink/70 font-medium tracking-wide">
              {t('insights.reviews.none')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
