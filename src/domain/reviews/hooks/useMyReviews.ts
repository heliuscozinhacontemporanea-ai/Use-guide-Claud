import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../auth';
import type { DatabaseCursor } from '../../database/ports/databasePort';
import { deleteReviewUseCase } from '../application/usecases/deleteReviewUseCase';
import { listMyReviewsUseCase } from '../application/usecases/listMyReviewsUseCase';
import { submitReviewUseCase } from '../application/usecases/submitReviewUseCase';
import type { FirestoreReview } from '../types/review';

const PAGE_SIZE = 20;

/** Avaliações da pessoa logada, com editar e excluir pelo backend. */
export function useMyReviews() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const uid = user?.uid ?? null;
  const [data, setData] = useState<FirestoreReview[]>([]);
  const [cursor, setCursor] = useState<DatabaseCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (from: DatabaseCursor | null) => {
      if (!uid) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const page = await listMyReviewsUseCase(uid, PAGE_SIZE, from);
        setData((current) => (from ? [...current, ...page.items] : page.items));
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      } catch (err: unknown) {
        console.error('[useMyReviews]', err instanceof Error ? err.name : 'UnknownError');
        setError(t('myReviews.errors.load'));
      } finally {
        setLoading(false);
      }
    },
    [uid, t]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  const remove = useCallback(async (reviewId: string) => {
    await deleteReviewUseCase(reviewId);
    setData((current) => current.filter((review) => review.id !== reviewId));
  }, []);

  const save = useCallback(async (review: FirestoreReview, rating: number, comment: string) => {
    await submitReviewUseCase(review.itemId, rating, comment, review.itemCollection, {
      occurrenceId: review.occurrenceId,
      ticketId: review.ticketId,
    });
    setData((current) =>
      current.map((candidate) =>
        candidate.id === review.id ? { ...candidate, rating, comment: comment.trim() } : candidate
      )
    );
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    reload: () => load(null),
    loadMore: () => load(cursor),
    remove,
    save,
  };
}

export type MyReviewsSource = ReturnType<typeof useMyReviews>;
