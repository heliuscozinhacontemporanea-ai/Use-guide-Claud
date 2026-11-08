import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminPage } from '../types/adminFinance';

/** Fila paginada do admin: carrega a primeira página e acrescenta as seguintes pelo cursor. */
export function useAdminFinanceQueue<T>(fetchPage: (cursor?: string) => Promise<AdminPage<T>>) {
  const [data, setData] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchRef.current(cursor);
      setData((current) => (cursor ? [...current, ...page.data] : page.data));
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNAVAILABLE');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(),
    loadMore: () => (nextCursor ? load(nextCursor) : Promise.resolve()),
  };
}
