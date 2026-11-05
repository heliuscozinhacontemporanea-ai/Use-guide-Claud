import { useCallback, useEffect, useState } from 'react';
import { getPartnerReportsUseCase } from '../application/usecases/getPartnerReportsUseCase';
import type { PartnerReportPeriod, PartnerReports } from '../types/partnerHome';

export function usePartnerReports(period: PartnerReportPeriod) {
  const [data, setData] = useState<PartnerReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPartnerReportsUseCase(period));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
