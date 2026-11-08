import { useCallback, useEffect, useState } from 'react';
import { listSessionEntriesUseCase } from '../application/usecases/listSessionEntriesUseCase';
import type { SessionEntry } from '../types/ticketing';

/** Entradas da sessão, lidas só quando a lista abre. */
export function useSessionEntries(eventListingId: string, occurrenceId: string, open: boolean) {
  const [data, setData] = useState<SessionEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listSessionEntriesUseCase(eventListingId, occurrenceId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoading(false);
    }
  }, [eventListingId, occurrenceId]);

  useEffect(() => {
    if (open) void reload();
  }, [open, reload]);

  return { data, loading, error, reload };
}
