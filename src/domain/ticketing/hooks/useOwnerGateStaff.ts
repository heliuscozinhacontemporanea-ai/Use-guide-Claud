import { useCallback, useEffect, useState } from 'react';
import { listOwnerGateStaffUseCase } from '../application/usecases/listOwnerGateStaffUseCase';
import type { OwnerGateStaff } from '../types/gateStaff';

/** Equipe da portaria do dono (C1), por evento. */
export function useOwnerGateStaff() {
  const [data, setData] = useState<OwnerGateStaff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await listOwnerGateStaffUseCase());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
