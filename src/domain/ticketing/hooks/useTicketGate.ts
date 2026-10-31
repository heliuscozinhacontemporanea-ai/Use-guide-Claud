import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventCheckIn, Ticket } from '../types/ticketing';
import { verifyAndConsumeOfflineQrToken } from '../utils/offlineTicketVerifier';

export interface GateResult {
  tone: 'success' | 'warn' | 'danger';
  message: string;
}

type GateInput = { qrToken: string } | { code: string };

// `fetch` sem rede rejeita com TypeError; erro do servidor chega como Error com a mensagem.
function isNetworkFailure(error: unknown): boolean {
  return !navigator.onLine || error instanceof TypeError;
}

/**
 * Portaria do evento: QR ou código de 8 caracteres com internet; sem internet, só o QR, conferido
 * pela assinatura no aparelho. O código nunca vale sem internet (D20, §7.7).
 */
export function useTicketGate({
  occurrenceId,
  performCheckIn,
  onOfflineRecorded,
}: {
  occurrenceId: string;
  performCheckIn: (
    occurrenceId: string,
    input: GateInput
  ) => Promise<{ ticket: Ticket; checkIn: EventCheckIn }>;
  onOfflineRecorded: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<GateResult | null>(null);

  const offline = useCallback(
    async (input: GateInput): Promise<GateResult> => {
      if (!('qrToken' in input)) {
        return { tone: 'warn', message: t('ticketGate.codeNeedsInternet') };
      }
      const verified = await verifyAndConsumeOfflineQrToken({
        rawToken: input.qrToken,
        occurrenceId,
      });
      if (!verified.valid) {
        return { tone: 'danger', message: t(`ticketGate.offline.${verified.reason}`) };
      }
      await onOfflineRecorded();
      return { tone: 'success', message: t('ticketGate.offlineSaved') };
    },
    [occurrenceId, onOfflineRecorded, t]
  );

  const submit = useCallback(
    async (input: GateInput): Promise<boolean> => {
      if (!occurrenceId) return false;
      setSending(true);
      setResult(null);
      try {
        const { ticket } = await performCheckIn(occurrenceId, input);
        setResult({
          tone: 'success',
          message: t('ticketGate.success', {
            name: ticket.holderName || t('ticketGate.holderFallback'),
            type: ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType'),
          }),
        });
        return true;
      } catch (error: unknown) {
        if (isNetworkFailure(error)) {
          const outcome = await offline(input);
          setResult(outcome);
          return outcome.tone === 'success';
        }
        setResult({
          tone: 'danger',
          message: error instanceof Error && error.message ? error.message : t('ticketGate.failed'),
        });
        return false;
      } finally {
        setSending(false);
      }
    },
    [occurrenceId, offline, performCheckIn, t]
  );

  return { submit, sending, result };
}
