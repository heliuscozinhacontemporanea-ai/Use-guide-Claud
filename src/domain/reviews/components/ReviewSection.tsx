import { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
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
}: ReviewSectionProps) {
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

  return (
    <div className="space-y-8">
      <ReviewSummary
        rating={itemRating ?? 0}
        reviewCount={itemReviewCount ?? 0}
        reviews={reviews}
      />

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3 text-teal-300 text-sm">
          <CheckCircle2 size={18} className="shrink-0 text-teal-400" />
          <span>Sua avaliação foi salva com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {isOwner ? (
        <GlassCard className="p-5 bg-teal-950/20 border-teal-500/20 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 text-teal-400">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-teal-300">Você é o proprietário deste local</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Parceiros não podem avaliar seus próprios estabelecimentos ou eventos. Você pode
              acompanhar as notas recebidas e responder aos comentários dos clientes diretamente no
              seu Painel de Parceiro.
            </p>
          </div>
        </GlassCard>
      ) : user ? (
        <ReviewForm
          existingReview={userReview}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <GlassCard className="p-6 border-dashed border-white/10 text-center bg-white/5 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-white/50">
              Para deixar sua avaliação, você precisa estar logado.
            </p>
            <button
              type="button"
              onClick={openLoginModal}
              className="min-h-[44px] px-6 py-3 rounded-xl bg-teal-600/20 text-teal-400 text-xs font-bold uppercase tracking-widest hover:bg-teal-600/30 transition-colors"
            >
              Fazer Login agora
            </button>
          </div>
        </GlassCard>
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
