import { useCallback, useEffect, useState } from 'react';
import { listEventCourtesiesUseCase } from '../application/usecases/listEventCourtesiesUseCase';
import type { CourtesyRow } from '../types/courtesy';

/** Lista de convidados do evento (p13). */
export function useEventCourtesies(eventListingId: string) {
  const [data, setData] = useState<CourtesyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await listEventCourtesiesUseCase(eventListingId));
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
