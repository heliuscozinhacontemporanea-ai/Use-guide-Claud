import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pendingCheckIns } from '../adapters/localPendingCheckInsAdapter';
import { saveEntryKeys, verifyEntryPassOffline } from '../adapters/webCryptoEntryPassVerifier';
import { checkInByCodeUseCase } from '../application/usecases/checkInByCodeUseCase';
import { checkInEntryUseCase } from '../application/usecases/checkInEntryUseCase';
import { getEntryVerificationKeysUseCase } from '../application/usecases/getEntryVerificationKeysUseCase';
import type { BookingSummary, OfferKind, UnitCheckInResult } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';
import { formatSlotTime } from '../utils/dates';
import { unitLabel } from '../utils/unitLabel';

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
  const { t, i18n } = useTranslation();
  const entry = kind === 'private_entry';
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [pending, setPending] = useState(() => pendingCheckIns.list(offerId).length);

  const send = useCallback(
    (payload: { code?: string; qrToken?: string; capturedAt?: string }) =>
      entry
        ? checkInEntryUseCase(offerId, slotId, payload)
        : checkInByCodeUseCase(offerId, slotId, {
            code: payload.code ?? '',
            ...(payload.capturedAt ? { capturedAt: payload.capturedAt } : {}),
          }),
    [entry, offerId, slotId]
  );

  // Cada código vale uma pessoa ou um grupo (D20): a tela diz qual entrou, com o nome na entrada nominal.
  const describe = useCallback(
    (checkIn: UnitCheckInResult): CheckInResult => {
      if (checkIn.alreadyCheckedIn) {
        return {
          tone: 'warn',
          message: t('serviceProof.partner.alreadyUsed', {
            time: formatSlotTime(checkIn.checkedInAt, i18n.language),
          }),
        };
      }
      const label = unitLabel(t, checkIn.booking, checkIn.unit);
      const total = checkIn.booking.participantsCount;
      return {
        tone: 'success',
        message: checkIn.name
          ? t('serviceProof.partner.successNamed', { name: checkIn.name })
          : t('serviceProof.partner.success', {
              unit:
                total > 1
                  ? `${label} · ${t('serviceProof.pass.unitOf', { n: checkIn.unit + 1, total })}`
                  : label,
            }),
      };
    },
    [i18n.language, t]
  );

  const sync = useCallback(async () => {
    for (const item of pendingCheckIns.list(offerId)) {
      try {
        const checkIn = await (item.kind === 'entry'
          ? checkInEntryUseCase(item.offerId, item.slotId, item.payload)
          : checkInByCodeUseCase(item.offerId, item.slotId, {
              ...item.payload,
              code: item.payload.code ?? '',
            }));
        pendingCheckIns.remove(item.id);
        onCheckedIn?.(checkIn.booking);
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
    async (input: { code?: string; qrToken?: string }) => {
      setSending(true);
      setResult(null);
      try {
        const checkIn = await send(input);
        setResult(describe(checkIn));
        onCheckedIn?.(checkIn.booking);
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
    [describe, entry, offerId, onCheckedIn, send, slotId, t]
  );

  return { submit, sending, result, pending, clearResult: () => setResult(null) };
}
