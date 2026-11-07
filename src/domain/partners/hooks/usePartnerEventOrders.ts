import { useCallback, useEffect, useRef, useState } from 'react';
import { listPartnerEventOrdersUseCase } from '../application/usecases/listPartnerEventOrdersUseCase';
import type { PartnerEventOrder, PartnerEventOrdersFilter } from '../types/partnerHome';

const SEARCH_DELAY_MS = 300;

/** Pedidos da página do evento, por página; busca e filtro recomeçam do primeiro pedido. */
export function usePartnerEventOrders(eventId: string, reloadKey: number) {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState<PartnerEventOrdersFilter>('all');
  const [data, setData] = useState<PartnerEventOrder[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Só a resposta da busca mais recente vale; uma lenta que chega depois é descartada.
  const request = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const reload = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    setError(null);
    try {
      const page = await listPartnerEventOrdersUseCase(eventId, { q: term, filter });
      if (id !== request.current) return;
      setData(page.data);
      setNextCursor(page.nextCursor);
      setTotal(page.total);
    } catch (err: unknown) {
      if (id !== request.current) return;
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [eventId, term, filter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: recarrega quando a chave muda.
  useEffect(() => {
    void reload();
  }, [reload, reloadKey]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    const id = request.current;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await listPartnerEventOrdersUseCase(eventId, {
        q: term,
        filter,
        cursor: nextCursor,
      });
      if (id !== request.current) return;
      setData((rows) => [...rows, ...page.data]);
      setNextCursor(page.nextCursor);
      setTotal(page.total);
    } catch (err: unknown) {
      if (id === request.current) setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoadingMore(false);
    }
  }, [eventId, term, filter, nextCursor, loadingMore]);

  return {
    query,
    setQuery,
    searching: term !== '',
    filter,
    setFilter,
    data,
    total,
    hasMore: nextCursor !== null,
    loading,
    loadingMore,
    error,
    reload,
    loadMore,
  };
}
