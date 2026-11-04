import { useCallback, useEffect, useState } from 'react';
import { getPartnerCatalogEventsUseCase } from '../application/usecases/getPartnerCatalogEventsUseCase';
import type { PartnerCatalogEvent } from '../types/partnerHome';

/** Eventos do Catálogo; `reloadKey` muda depois de salvar um evento. */
export function usePartnerCatalogEvents(reloadKey: number) {
  const [data, setData] = useState<PartnerCatalogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPartnerCatalogEventsUseCase());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: recarrega quando a chave muda.
  useEffect(() => {
    void reload();
  }, [reload, reloadKey]);

  return { data, loading, error, reload };
}
