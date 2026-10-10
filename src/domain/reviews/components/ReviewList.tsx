import { RefreshCw, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FirestoreReview } from '../types/review';
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
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 opacity-30">
        <Star size={36} className="mx-auto mb-2 text-white/50" />
        <p className="text-xs font-bold uppercase tracking-widest text-white/50">
          Sem avaliações ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
          >
            <ReviewCard
              userName={review.userName}
              userPhoto={review.userPhoto}
              rating={review.rating}
              comment={review.comment}
              partnerResponse={review.partnerResponse}
              createdAt={review.createdAt}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="w-full min-h-[44px] py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          {isLoadingMore ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Carregando mais...</span>
            </>
          ) : (
            <span>Carregar mais avaliações</span>
          )}
        </button>
      )}
    </div>
  );
}
