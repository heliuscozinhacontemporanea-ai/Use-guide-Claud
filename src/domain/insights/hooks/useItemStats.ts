import { useState, useEffect, useCallback } from 'react';
import { getItemStatsUseCase } from '../application/usecases/getItemStatsUseCase';
import { ItemStats } from '../types/interaction';

export function useItemStats(itemId: string | null, itemCollection: 'items' | 'events' = 'items') {
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!itemId) {
      setStats(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getItemStatsUseCase(itemId, itemCollection);
      setStats(data);
    } catch (err) {
      // Guarda o `code` estável (§10.2); quem mostra traduz (ex.: LISTING_PLAN_REQUIRED).
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoading(false);
    }
  }, [itemId, itemCollection]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
