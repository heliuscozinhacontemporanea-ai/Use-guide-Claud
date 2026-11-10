import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../shared/stores/useUIStore';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useReviews } from '../hooks/useReviews';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { ReviewSort } from './ReviewSort';
import { ReviewSummary } from './ReviewSummary';

interface ReviewSectionProps {
  itemId: string;
  itemCollection?: 'items' | 'events';
  itemRating?: number;
  itemReviewCount?: number;
  partnerId?: string;
  ownerId?: string;
  occurrenceId?: string;
  ticketId?: string;
  /** Pergunta do convite para avaliar, conforme o tipo do anúncio. */
  prompt?: 'tour' | 'stay' | 'restaurant' | 'event' | 'default';
}

export function ReviewSection({
  itemId,
  itemCollection = 'items',
  itemRating,
  itemReviewCount,
  partnerId,
  ownerId,
  occurrenceId,
  ticketId,
  prompt,
}: ReviewSectionProps) {
  const { t } = useTranslation();
  const [writing, setWriting] = useState(false);
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isOwner = Boolean(user?.uid && (user.uid === partnerId || user.uid === ownerId));

  const {
    reviews,
    userReview,
    loading,
    isLoadingMore,
    hasMore,
    error,
    sortBy,
    setSortBy,
    isSubmitting,
    loadMore,
    submitReview,
  } = useReviews(
    itemId,
    user?.uid,
    itemCollection,
    occurrenceId || ticketId ? { occurrenceId, ticketId } : undefined
  );

  const handleSubmit = async (rating: number, comment: string) => {
    setSubmitSuccess(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await submitReview(rating, comment);
    setSubmitSuccess(true);
    timeoutRef.current = setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  const promptKey = prompt ?? 'default';
  const card = 'rounded-[20px] bg-surface border border-line p-4';

  return (
    <div className="space-y-3">
      <ReviewSummary rating={itemRating ?? 0} reviewCount={itemReviewCount ?? 0} />

      {submitSuccess && (
        <p role="status" className="flex items-center gap-2 px-1 text-[14px] text-success">
          <CheckCircle2 size={16} aria-hidden="true" />
          {t('reviewsUi.saved')}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-2 px-1 text-[14px] text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {isOwner ? (
        <div className={`${card} space-y-1`}>
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <ShieldAlert size={16} className="text-accent" aria-hidden="true" />
            {t('reviewsUi.ownerTitle')}
          </p>
          <p className="text-[14px] text-ink/75">{t('reviewsUi.ownerText')}</p>
        </div>
      ) : user && (writing || userReview) ? (
        <ReviewForm
          existingReview={userReview}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className={`${card} space-y-3 text-center`}>
          <p className="text-[14px] text-ink/75">{t(`reviewsUi.prompt.${promptKey}`)}</p>
          <button
            type="button"
            onClick={() => (user ? setWriting(true) : openLoginModal())}
            className="press w-full min-h-[52px] rounded-2xl bg-accent-soft text-accent text-[16px] font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            {t('reviewsUi.rate')}
          </button>
        </div>
      )}

      <ReviewSort value={sortBy} onChange={setSortBy} />

      <ReviewList
        reviews={reviews}
        loading={loading}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
