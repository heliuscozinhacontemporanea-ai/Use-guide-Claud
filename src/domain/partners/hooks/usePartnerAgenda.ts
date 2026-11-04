import { useCallback, useEffect, useState } from 'react';
import { getPartnerAgendaUseCase } from '../application/usecases/getPartnerAgendaUseCase';
import type { PartnerTodayItem } from '../types/partnerHome';

/** Horários e sessões de um período (a semana ou o mês da Agenda). */
export function usePartnerAgenda(from: Date | null, to: Date | null) {
  const [data, setData] = useState<PartnerTodayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fromIso = from?.toISOString() ?? null;
  const toIso = to?.toISOString() ?? null;

  const reload = useCallback(async () => {
    if (!fromIso || !toIso) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getPartnerAgendaUseCase(fromIso, toIso));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setLoading(false);
    }
  }, [fromIso, toIso]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
