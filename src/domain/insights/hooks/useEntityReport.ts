import { useCallback, useEffect, useState } from 'react';
import { getReviewsUseCase } from '../../reviews';
import { getItemStatsUseCase } from '../application/usecases/getItemStatsUseCase';
import type { ItemStats } from '../types/interaction';
import type { PartnerReview, ReportCollection } from '../types/report';

const REVIEWS_PAGE_SIZE = 50;

interface ReportTarget {
  id: string;
  type: ReportCollection;
}

/** Métricas e avaliações do item selecionado no relatório do parceiro. */
export function useEntityReport(target: ReportTarget | null) {
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [reviews, setReviews] = useState<PartnerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const targetId = target?.id;
  const targetType = target?.type;

  const load = useCallback(async () => {
    if (!targetId || !targetType) return;
    setLoading(true);
    setError(false);
    try {
      const [itemStats, reviewsPage] = await Promise.all([
        getItemStatsUseCase(targetId, targetType),
        getReviewsUseCase(targetId, REVIEWS_PAGE_SIZE, 'recent', null, targetType),
      ]);
      setStats(itemStats);
      setReviews(reviewsPage.items);
    } catch (err) {
      console.error('[useEntityReport Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    void load();
  }, [load]);

  const markReplied = useCallback((reviewId: string, partnerResponse: string) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? { ...review, partnerResponse } : review))
    );
  }, []);

  return { stats, reviews, loading, error, reload: load, markReplied };
}
