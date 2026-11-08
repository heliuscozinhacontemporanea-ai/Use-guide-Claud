import { useCallback, useEffect, useState } from 'react';
import { getPartnerEarningsUseCase } from '../application/usecases/getPartnerEarningsUseCase';
import type { PartnerEarnings } from '../types/partnerHome';

export function usePartnerEarnings() {
  const [data, setData] = useState<PartnerEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPartnerEarningsUseCase());
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
