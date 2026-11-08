import { useCallback, useEffect, useState } from 'react';
import { listPayoutsUseCase } from '../application/usecases/listPayoutsUseCase';
import type { PayoutEntryView } from '../types/receivables';
import { receivablesErrorKey } from '../utils/receivablesFormat';

/** Extrato por venda, paginado por cursor; `accountKey` filtra um CNPJ. */
export function usePartnerPayouts(accountKey?: string) {
  const [entries, setEntries] = useState<PayoutEntryView[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);
      try {
        const page = await listPayoutsUseCase({ accountKey, cursor });
        setEntries((current) => (cursor ? [...current, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
      } catch (err) {
        setError(receivablesErrorKey(err));
      } finally {
        setLoading(false);
      }
    },
    [accountKey]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    entries,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(),
    loadMore: () => (nextCursor ? load(nextCursor) : Promise.resolve()),
  };
}
