import { useCallback, useEffect, useState } from 'react';
import { getCheckInCodeUseCase } from '../application/usecases/getCheckInCodeUseCase';
import { getEntryPassUseCase } from '../application/usecases/getEntryPassUseCase';
import { setParticipantNameUseCase } from '../application/usecases/setParticipantNameUseCase';
import type { BookingSummary, EntryPassView } from '../types/bookings';

/** Códigos (6) ou QR e código da entrada (8) de cada unidade da reserva confirmada (D20). */
export function useBookingCheckInPass(booking: BookingSummary, enabled: boolean) {
  const [data, setData] = useState<EntryPassView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (booking.kind === 'private_entry') {
        setData(await getEntryPassUseCase(booking.id));
      } else {
        const { codes, ...window } = await getCheckInCodeUseCase(booking.id);
        setData({ ...window, passes: codes.map((code) => ({ ...code, qrToken: null })) });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [booking.id, booking.kind]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  // O QR leva o nome assinado: depois de salvar, a entrada é recarregada do servidor.
  const saveName = useCallback(
    async (unit: number, name: string) => {
      await setParticipantNameUseCase(booking.id, unit, name);
      await load();
    },
    [booking.id, load]
  );

  return { data, loading, error, reload: load, saveName };
}
