import { useCallback, useEffect, useState } from 'react';
import { getAdminStatsUseCase } from '../application/usecases/getAdminStatsUseCase';
import type { AdminStats } from '../types/admin';

export function useAdminStats(enabled: boolean) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setStats(await getAdminStatsUseCase());
    } catch (err) {
      console.error('[useAdminStats]', err);
      setError('Não foi possível carregar os relatórios agora.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  return { stats, error, isLoading, reload };
}

