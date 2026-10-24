import { useCallback, useEffect, useState } from 'react';
import { getReviewsUseCase } from '../../reviews';
import { getItemStatsUseCase } from '../application/usecases/getItemStatsUseCase';
import type { ItemStats } from '../types/interaction';
import type { PartnerReview, ReportCollection } from '../types/report';

const REVIEWS_PAGE_SIZE = 50;
const PLAN_REQUIRED = 'LISTING_PLAN_REQUIRED';

interface ReportTarget {
  id: string;
  type: ReportCollection;
}

/**
 * Métricas e avaliações do item selecionado no relatório do parceiro. As métricas exigem o plano
 * do estabelecimento (D11); as avaliações não, por isso as duas cargas falham separadas.
 */
export function useEntityReport(target: ReportTarget | null) {
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [statsLocked, setStatsLocked] = useState(false);
  const [reviews, setReviews] = useState<PartnerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const targetId = target?.id;
  const targetType = target?.type;

  const load = useCallback(async () => {
    if (!targetId || !targetType) return;
    setLoading(true);
    setError(false);
    setStatsLocked(false);
    const [statsResult, reviewsResult] = await Promise.allSettled([
      getItemStatsUseCase(targetId, targetType),
      getReviewsUseCase(targetId, REVIEWS_PAGE_SIZE, 'recent', null, targetType),
    ]);
    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value);
    } else {
      setStats(null);
      const locked =
        statsResult.reason instanceof Error && statsResult.reason.message === PLAN_REQUIRED;
      setStatsLocked(locked);
      if (!locked) {
        console.error('[useEntityReport Error]:', statsResult.reason);
        setError(true);
      }
    }
    if (reviewsResult.status === 'fulfilled') {
      setReviews(reviewsResult.value.items);
    } else {
      console.error('[useEntityReport Error]:', reviewsResult.reason);
      setError(true);
    }
    setLoading(false);
  }, [targetId, targetType]);

  useEffect(() => {
    void load();
  }, [load]);

  const markReplied = useCallback((reviewId: string, partnerResponse: string) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? { ...review, partnerResponse } : review))
    );
  }, []);

  return { stats, statsLocked, reviews, loading, error, reload: load, markReplied };
}
