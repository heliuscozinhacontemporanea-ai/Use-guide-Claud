import { useCallback, useEffect, useState } from 'react';
import { pendingCheckIns } from '../adapters/localPendingCheckInsAdapter';
import { checkInByEstablishmentCodeUseCase } from '../application/usecases/checkInByEstablishmentCodeUseCase';
import type { EstablishmentCheckInResult } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export type EstablishmentCheckInOutcome =
  | { status: 'done'; result: EstablishmentCheckInResult }
  | { status: 'saved' }
  | { status: 'failed'; message: string };

// `fetch` sem rede rejeita com TypeError; erro do servidor chega como Error com o código.
const isNetworkFailure = (error: unknown) => !navigator.onLine || error instanceof TypeError;

/**
 * "Inserir código" do estabelecimento (D27): sem sinal, o código fica guardado no aparelho com a
 * hora em que foi digitado e vai quando a conexão volta (D20).
 */
export function useEstablishmentCheckIn(
  guideItemId: string,
  offerId: string,
  slotId: string,
  onCheckedIn: () => void
) {
  const queued = useCallback(
    () => pendingCheckIns.list(offerId).filter((item) => item.kind === 'establishment'),
    [offerId]
  );
  const [pending, setPending] = useState(() => queued().length);
  const [sending, setSending] = useState(false);

  const sync = useCallback(async () => {
    let changed = false;
    for (const item of queued()) {
      try {
        await checkInByEstablishmentCodeUseCase(item.guideItemId ?? guideItemId, {
          code: item.payload.code ?? '',
          capturedAt: item.payload.capturedAt,
        });
        pendingCheckIns.remove(item.id);
        changed = true;
      } catch (error: unknown) {
        if (isNetworkFailure(error)) break;
        pendingCheckIns.remove(item.id);
      }
    }
    setPending(queued().length);
    if (changed) onCheckedIn();
  }, [guideItemId, onCheckedIn, queued]);

  useEffect(() => {
    const onOnline = () => void sync();
    window.addEventListener('online', onOnline);
    if (navigator.onLine) void sync();
    return () => window.removeEventListener('online', onOnline);
  }, [sync]);

  const submit = useCallback(
    async (code: string): Promise<EstablishmentCheckInOutcome> => {
      setSending(true);
      try {
        const result = await checkInByEstablishmentCodeUseCase(guideItemId, { code });
        onCheckedIn();
        return { status: 'done', result };
      } catch (error: unknown) {
        if (!isNetworkFailure(error)) {
          return { status: 'failed', message: getBookingErrorMessage(error) };
        }
        pendingCheckIns.add({
          offerId,
          slotId,
          kind: 'establishment',
          guideItemId,
          payload: { code, capturedAt: new Date().toISOString() },
        });
        setPending(queued().length);
        return { status: 'saved' };
      } finally {
        setSending(false);
      }
    },
    [guideItemId, offerId, slotId, onCheckedIn, queued]
  );

  return { submit, sending, pending };
}
