import { useCallback, useEffect, useState } from 'react';
import { listMyPromotionsUseCase } from '../application/usecases/listMyPromotionsUseCase';
import type { MyPromotion } from '../types/promoter';

/** Divulgação do usuário (p26). `enabled` falso não busca (conta sem login). */
export function useMyPromotions(enabled = true) {
  const [data, setData] = useState<MyPromotion[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(false);
    try {
      setData(await listMyPromotionsUseCase());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
