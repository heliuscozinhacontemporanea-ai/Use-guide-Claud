import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pendingCheckIns } from '../adapters/localPendingCheckInsAdapter';
import { saveEntryKeys, verifyEntryPassOffline } from '../adapters/webCryptoEntryPassVerifier';
import { checkInByCodeUseCase } from '../application/usecases/checkInByCodeUseCase';
import { checkInEntryUseCase } from '../application/usecases/checkInEntryUseCase';
import { getEntryVerificationKeysUseCase } from '../application/usecases/getEntryVerificationKeysUseCase';
import type { BookingSummary, OfferKind } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export interface CheckInResult {
  tone: 'success' | 'warn' | 'danger';
  message: string;
}

// `fetch` sem rede rejeita com TypeError; erro do servidor chega como Error com o código.
function isNetworkFailure(error: unknown): boolean {
  return !navigator.onLine || error instanceof TypeError;
}

/** Check-in de um horário pelo código ou pelo QR, com fila no aparelho quando falta sinal (D20). */
export function useSlotCheckIn(
  offerId: string,
  slotId: string,
  kind: OfferKind,
  onCheckedIn?: (booking: BookingSummary) => void
) {
  const { t } = useTranslation();
  const entry = kind === 'private_entry';
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [pending, setPending] = useState(() => pendingCheckIns.list(offerId).length);

  const send = useCallback(
    (payload: {
      code?: string;
      qrToken?: string;
      participantsPresent: number;
      capturedAt?: string;
    }) =>
      entry
        ? checkInEntryUseCase(offerId, slotId, payload)
        : checkInByCodeUseCase(offerId, slotId, {
            code: payload.code ?? '',
            participantsPresent: payload.participantsPresent,
            ...(payload.capturedAt ? { capturedAt: payload.capturedAt } : {}),
          }),
    [entry, offerId, slotId]
  );

  const sync = useCallback(async () => {
    for (const item of pendingCheckIns.list(offerId)) {
      try {
        const booking = await (item.kind === 'entry'
          ? checkInEntryUseCase(item.offerId, item.slotId, item.payload)
          : checkInByCodeUseCase(item.offerId, item.slotId, {
              ...item.payload,
              code: item.payload.code ?? '',
            }));
        pendingCheckIns.remove(item.id);
        onCheckedIn?.(booking);
      } catch (error: unknown) {
        if (isNetworkFailure(error)) break;
        // Recusado pelo servidor (código errado, fora do prazo): sai da fila e o prestador vê o motivo.
        pendingCheckIns.remove(item.id);
        setResult({ tone: 'danger', message: getBookingErrorMessage(error) });
      }
    }
    setPending(pendingCheckIns.list(offerId).length);
  }, [offerId, onCheckedIn]);

  useEffect(() => {
    if (entry && navigator.onLine) {
      void getEntryVerificationKeysUseCase(offerId)
        .then((keys) => saveEntryKeys(offerId, keys))
        .catch(() => undefined);
    }
    const onOnline = () => void sync();
    window.addEventListener('online', onOnline);
    if (navigator.onLine) void sync();
    return () => window.removeEventListener('online', onOnline);
  }, [entry, offerId, sync]);

  const submit = useCallback(
    async (input: { code?: string; qrToken?: string; participantsPresent: number }) => {
      setSending(true);
      setResult(null);
      try {
        const booking = await send(input);
        const count = booking.checkIn?.participantsPresent ?? input.participantsPresent;
        setResult({ tone: 'success', message: t('serviceProof.partner.success', { count }) });
        onCheckedIn?.(booking);
        return true;
      } catch (error: unknown) {
        if (!isNetworkFailure(error)) {
          setResult({ tone: 'danger', message: getBookingErrorMessage(error) });
          return false;
        }
        const offline = input.qrToken
          ? await verifyEntryPassOffline(offerId, slotId, input.qrToken)
          : 'unsupported';
        if (offline === 'invalid') {
          setResult({ tone: 'danger', message: t('serviceProof.partner.offlineInvalid') });
          return false;
        }
        pendingCheckIns.add({
          offerId,
          slotId,
          kind: entry ? 'entry' : 'code',
          payload: { ...input, capturedAt: new Date().toISOString() },
        });
        setPending(pendingCheckIns.list(offerId).length);
        setResult({
          tone: offline === 'valid' ? 'success' : 'warn',
          message: t(
            offline === 'valid'
              ? 'serviceProof.partner.offlineValid'
              : 'serviceProof.partner.savedOffline'
          ),
        });
        return true;
      } finally {
        setSending(false);
      }
    },
    [entry, offerId, onCheckedIn, send, slotId, t]
  );

  return { submit, sending, result, pending, clearResult: () => setResult(null) };
}
