import { useCallback, useEffect, useState } from 'react';
import { listAvailableSlotsUseCase } from '../application/usecases/listAvailableSlotsUseCase';
import type { PublicSlot } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

const WINDOW_DAYS = 30;

export function usePublicSlots(offerId: string) {
  const [data, setData] = useState<PublicSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = new Date();
    const to = new Date(from.getTime() + WINDOW_DAYS * 86_400_000);
    try {
      setData(await listAvailableSlotsUseCase(offerId, from.toISOString(), to.toISOString()));
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
