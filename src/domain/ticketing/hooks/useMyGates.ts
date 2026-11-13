import { useCallback, useEffect, useState } from 'react';
import { listMyGatesUseCase } from '../application/usecases/listMyGatesUseCase';
import type { MyGate } from '../types/gateStaff';

/** Portarias da pessoa (C1): convites e equipes. `enabled` falso não busca (conta sem login). */
export function useMyGates(enabled = true) {
  const [data, setData] = useState<MyGate[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(false);
    try {
      setData(await listMyGatesUseCase());
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
