import { useCallback, useEffect, useState } from 'react';
import { getCheckInCodeUseCase } from '../application/usecases/getCheckInCodeUseCase';
import { getEntryPassUseCase } from '../application/usecases/getEntryPassUseCase';
import type { BookingSummary, EntryPassView } from '../types/bookings';

/** Código de check-in (6) ou QR e código da entrada (8) da reserva confirmada (D20). */
export function useBookingCheckInPass(booking: BookingSummary, enabled: boolean) {
  const [data, setData] = useState<EntryPassView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(
        booking.kind === 'private_entry'
          ? await getEntryPassUseCase(booking.id)
          : { ...(await getCheckInCodeUseCase(booking.id)), qrToken: null }
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [booking.id, booking.kind]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  return { data, loading, error, reload: load };
}
