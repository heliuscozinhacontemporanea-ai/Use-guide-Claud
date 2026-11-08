import { useCallback, useEffect, useState } from 'react';
import { getPartnerHomeUseCase } from '../application/usecases/getPartnerHomeUseCase';
import type { PartnerHomeView } from '../types/partnerHome';

export function usePartnerHome() {
  const [data, setData] = useState<PartnerHomeView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPartnerHomeUseCase());
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
