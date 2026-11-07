import { useCallback, useEffect, useState } from 'react';
import { getEventPromotersUseCase } from '../application/usecases/getEventPromotersUseCase';
import type { EventPromotersSummary } from '../types/promoter';

/** Divulgadores do evento com vendas e quanto o organizador deve (p16). */
export function useEventPromoters(eventListingId: string) {
  const [data, setData] = useState<EventPromotersSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await getEventPromotersUseCase(eventListingId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [eventListingId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
