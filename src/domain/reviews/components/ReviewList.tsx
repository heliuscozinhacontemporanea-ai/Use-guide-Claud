import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ListLoading } from '../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../ui/styles/controls';
import type { FirestoreReview } from '../types/review';
import { ReviewCard } from './ReviewCard';

interface ReviewListProps {
  reviews: FirestoreReview[];
  loading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function ReviewList({
  reviews,
  loading,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ReviewListProps) {
  const { t } = useTranslation();
  if (loading) return <ListLoading label={t('reviewsUi.title')} />;
  if (reviews.length === 0) {
    return <p className="py-6 text-center text-[14px] text-ink/60">{t('reviewsUi.empty')}</p>;
  }
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          userName={review.userName}
          rating={review.rating}
          comment={review.comment}
          partnerResponse={review.partnerResponse}
          createdAt={review.createdAt}
          verified={review.verifiedAttendance}
        />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className={`${BUTTON_SECONDARY} w-full inline-flex items-center justify-center gap-2`}
        >
          {isLoadingMore && (
            <Loader2
              size={16}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {t(isLoadingMore ? 'reviewsUi.loadingMore' : 'reviewsUi.loadMore')}
        </button>
      )}
    </div>
  );
}
