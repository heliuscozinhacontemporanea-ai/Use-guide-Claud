import { useCallback, useEffect, useState } from 'react';
import { getPartnerEventSalesUseCase } from '../application/usecases/getPartnerEventSalesUseCase';
import type { PartnerEventSales } from '../types/partnerHome';

/** Vendas da página do evento; `reloadKey` muda depois de adiar ou cancelar uma sessão. */
export function usePartnerEventSalesPage(eventId: string, reloadKey: number) {
  const [data, setData] = useState<PartnerEventSales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPartnerEventSalesUseCase(eventId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: recarrega quando a chave muda.
  useEffect(() => {
    void reload();
  }, [reload, reloadKey]);

  return { data, loading, error, reload };
}
