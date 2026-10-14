import { useCallback, useEffect, useState } from 'react';
import { listEventOccurrencesUseCase } from '../application/usecases/listEventOccurrencesUseCase';
import type { EventOccurrence } from '../types/event';

export function useEventOccurrences(eventListingId: string | undefined | null) {
  const [occurrences, setOccurrences] = useState<EventOccurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!eventListingId) {
      setOccurrences([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listEventOccurrencesUseCase(eventListingId);
      setOccurrences(list);
    } catch (err) {
      console.error('[useEventOccurrences.reload]', err);
      setError('Não foi possível carregar as datas do evento agora.');
    } finally {
      setLoading(false);
    }
  }, [eventListingId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    occurrences,
    loading,
    error,
    reload,
  };
}
