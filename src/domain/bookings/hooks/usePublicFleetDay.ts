import { useCallback, useEffect, useState } from 'react';
import { getPublicFleetDayUseCase } from '../application/usecases/getPublicFleetDayUseCase';
import type { PublicFleetDay } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

/** O dia escolhido de uma oferta por veículo (F3b); vazio enquanto o app procura o primeiro dia aberto. */
export function usePublicFleetDay(offerId: string, date: string) {
  const [data, setData] = useState<PublicFleetDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Sem dia escolhido ainda (o app procura o primeiro dia com horário).
    if (!date) return;
    try {
      setData(await getPublicFleetDayUseCase(offerId, date));
    } catch (err: unknown) {
      setData(null);
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [offerId, date]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
