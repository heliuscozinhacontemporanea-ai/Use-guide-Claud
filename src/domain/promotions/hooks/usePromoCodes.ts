import { useCallback, useEffect, useState } from 'react';
import { listPromoCodesUseCase } from '../application/usecases/listPromoCodesUseCase';
import type { PromoCodesData } from '../types/promoCode';

/** Cupons do parceiro e os eventos onde ele pode criar um. */
export function usePromoCodes() {
  const [data, setData] = useState<PromoCodesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPromoCodesUseCase());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
