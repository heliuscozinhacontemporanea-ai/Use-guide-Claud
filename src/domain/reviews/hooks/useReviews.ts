import { useCallback, useEffect, useMemo, useState } from 'react';
import { getReviewsUseCase } from '../application/usecases/getReviewsUseCase';
import { getUserReviewUseCase } from '../application/usecases/getUserReviewUseCase';
import { subscribeToReviewsUseCase } from '../application/usecases/subscribeToReviewsUseCase';
import { submitReviewUseCase } from '../application/usecases/submitReviewUseCase';
import { DatabaseCursor } from '../../database/ports/databasePort';
import { FirestoreReview, ReviewSortOption } from '../types/review';

const PAGE_SIZE = 10;

function compareReviews(a: FirestoreReview, b: FirestoreReview, sortBy: ReviewSortOption): number {
  if (sortBy === 'highest') {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
  }
  if (sortBy === 'lowest') {
    if (a.rating !== b.rating) {
      return a.rating - b.rating;
    }
  }
  const aDate = toTimestamp(a.createdAt);
  const bDate = toTimestamp(b.createdAt);
  return bDate - aDate;
}

function toTimestamp(value: FirestoreReview['createdAt']): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
  return 0;
}

function mergeUniqueReviews(groups: FirestoreReview[][]): FirestoreReview[] {
  const reviewsById = new Map<string, FirestoreReview>();
  for (const group of groups) {
    for (const review of group) {
      reviewsById.set(review.id, review);
    }
  }
  return Array.from(reviewsById.values());
}

export function useReviews(
  itemId: string,
  userId?: string,
  itemCollection: 'items' | 'events' = 'items',
  options?: { occurrenceId?: string; ticketId?: string }
) {
  const [realtimeReviews, setRealtimeReviews] = useState<FirestoreReview[]>([]);
  const [pagedReviews, setPagedReviews] = useState<FirestoreReview[]>([]);
  const [userReview, setUserReview] = useState<FirestoreReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<DatabaseCursor | null>(null);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('recent');

  const reviews = useMemo(() => {
    return mergeUniqueReviews([realtimeReviews, pagedReviews]).sort((a, b) =>
      compareReviews(a, b, sortBy)
    );
  }, [pagedReviews, realtimeReviews, sortBy]);

  const loadFirstPage = useCallback(
    async (selectedSort: ReviewSortOption) => {
      setLoading(true);
      setError(null);
      setCursor(null);
      setHasMore(false);
      setPagedReviews([]);
      try {
        const page = await getReviewsUseCase(itemId, PAGE_SIZE, selectedSort, null, itemCollection);
        setPagedReviews(page.items);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      } catch (err) {
        console.error('[useReviews] Error loading reviews:', err);
        setError('Não foi possível carregar as avaliações no momento.');
      } finally {
        setLoading(false);
      }
    },
    [itemId, itemCollection]
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursor) {
      return;
    }
    setIsLoadingMore(true);
    setError(null);
    try {
      const page = await getReviewsUseCase(itemId, PAGE_SIZE, sortBy, cursor, itemCollection);
      setPagedReviews((current) => mergeUniqueReviews([current, page.items]));
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (err) {
      console.error('[useReviews] Error loading more reviews:', err);
      setError('Não foi possível carregar mais avaliações.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, hasMore, isLoadingMore, itemId, sortBy, itemCollection]);

  const submitReview = useCallback(
    async (rating: number, comment: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        if (options?.occurrenceId || options?.ticketId) {
          await submitReviewUseCase(itemId, rating, comment, itemCollection, options);
        } else {
          await submitReviewUseCase(itemId, rating, comment, itemCollection);
        }
        if (!userId) {
          return;
        }
        const updatedReview = options?.occurrenceId
          ? await getUserReviewUseCase(itemId, userId, itemCollection, options.occurrenceId)
          : await getUserReviewUseCase(itemId, userId, itemCollection);
        setUserReview(updatedReview);
        if (updatedReview) {
          setRealtimeReviews((current) => mergeUniqueReviews([current, [updatedReview]]));
        }
      } catch (err) {
        console.error('[useReviews] Error submitting review:', err);
        const message = err instanceof Error ? err.message : 'Erro ao enviar avaliação.';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [itemId, userId, itemCollection, options]
  );

  useEffect(() => {
    void loadFirstPage(sortBy);
  }, [loadFirstPage, sortBy]);

  useEffect(() => {
    if (!userId) {
      setUserReview(null);
      return;
    }
    let active = true;
    const promise = options?.occurrenceId
      ? getUserReviewUseCase(itemId, userId, itemCollection, options.occurrenceId)
      : getUserReviewUseCase(itemId, userId, itemCollection);
    void promise
      .then((review) => {
        if (active) {
          setUserReview(review);
        }
      })
      .catch((err) => {
        console.error('[useReviews] Error loading user review:', err);
      });
    return () => {
      active = false;
    };
  }, [itemId, userId, itemCollection, options?.occurrenceId]);

  useEffect(() => {
    setRealtimeReviews([]);
    const unsubscribe = subscribeToReviewsUseCase(
      itemId,
      PAGE_SIZE,
      sortBy,
      (nextReviews) => {
        setRealtimeReviews(nextReviews);
        setLoading(false);
      },
      (subscriptionError) => {
        console.error('[useReviews] Realtime subscription error:', subscriptionError);
        setError('Não foi possível atualizar as avaliações em tempo real.');
      },
      itemCollection
    );
    return unsubscribe;
  }, [itemId, sortBy, itemCollection]);

  return {
    reviews,
    userReview,
    loading,
    isLoadingMore,
    isSubmitting,
    error,
    hasMore,
    sortBy,
    setSortBy,
    loadMore,
    submitReview,
  };
}
