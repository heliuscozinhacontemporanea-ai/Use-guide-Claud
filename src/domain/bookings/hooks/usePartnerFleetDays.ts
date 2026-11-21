import { useCallback, useEffect, useState } from 'react';
import { listFleetDaysUseCase } from '../application/usecases/listFleetDaysUseCase';
import { openFleetDaysUseCase } from '../application/usecases/openFleetDaysUseCase';
import type { OpenFleetDaysPayload, PartnerFleetDay } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

/** Dias com veículos de uma semana da oferta (F3b); abrir dias relê a semana. */
export function usePartnerFleetDays(offerId: string, fromDate: string, toDate: string) {
  const [data, setData] = useState<PartnerFleetDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listFleetDaysUseCase(offerId, fromDate, toDate));
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [offerId, fromDate, toDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const open = useCallback(
    async (payload: OpenFleetDaysPayload) => {
      const opened = await openFleetDaysUseCase(offerId, payload);
      await reload();
      return opened;
    },
    [offerId, reload]
  );

  return { data, loading, error, reload, open };
}
