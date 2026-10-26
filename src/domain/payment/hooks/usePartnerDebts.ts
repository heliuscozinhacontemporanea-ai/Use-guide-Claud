import { useCallback, useEffect, useState } from 'react';
import { listDebtsUseCase } from '../application/usecases/listDebtsUseCase';
import type { AccountDebtView } from '../types/receivables';
import { receivablesErrorKey } from '../utils/receivablesFormat';

export function usePartnerDebts() {
  const [debts, setDebts] = useState<AccountDebtView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDebts(await listDebtsUseCase());
    } catch (err) {
      setError(receivablesErrorKey(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { debts, loading, error, reload };
}
