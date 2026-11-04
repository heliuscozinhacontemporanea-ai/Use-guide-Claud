import { useTranslation } from 'react-i18next';
import { CHECK_IN_ALPHABET } from '../../../../shared/constants/checkInCode';
import { GateModeScreen, type GateOutcome } from '../../../../ui/components/GateModeScreen';
import { useOfflineTicketSession } from '../../hooks/useOfflineTicketSession';
import type { usePartnerEventSales } from '../../hooks/usePartnerEventSales';
import { useTicketGate } from '../../hooks/useTicketGate';
import { TICKET_CODE_LENGTH, TICKET_CODE_PREFIX } from '../../utils/ticketCode';

/** Portaria de uma sessão: lista sem internet e conferência do QR ou do código (D21). */
export function useSessionGate(
  occurrenceId: string,
  performCheckIn: ReturnType<typeof usePartnerEventSales>['performCheckIn'],
  reloadSales: () => Promise<void> | void
) {
  const session = useOfflineTicketSession(occurrenceId, reloadSales);
  const gate = useTicketGate({
    occurrenceId,
    performCheckIn: async (id, input) => {
      const result = await performCheckIn(id, input);
      await session.refresh();
      return result;
    },
    onOfflineRecorded: session.refresh,
  });
  return { session, gate };
}

/** Modo portaria em tela cheia para uma sessão de evento. */
export function SessionGateScreen({
  sessionLabel,
  entries,
  session,
  gate,
  onClose,
}: {
  sessionLabel: string;
  entries: number;
  session: ReturnType<typeof useSessionGate>['session'];
  gate: ReturnType<typeof useSessionGate>['gate'];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const toOutcome = (result: Awaited<ReturnType<typeof gate.evaluate>>): GateOutcome => ({
    tone: result.tone,
    headline: t(
      result.tone === 'success'
        ? 'gateMode.allowed'
        : result.tone === 'warn'
          ? 'gateMode.attention'
          : 'gateMode.denied'
    ),
    detail: result.detail ?? result.message,
  });
  return (
    <GateModeScreen
      title={sessionLabel}
      stats={t('ticketGate.entries', { count: entries })}
      online={session.isOnline}
      codePrefix={TICKET_CODE_PREFIX}
      codeLength={TICKET_CODE_LENGTH}
      codeAlphabet={CHECK_IN_ALPHABET}
      onQr={async (qrToken) => toOutcome(await gate.evaluate({ qrToken }))}
      onCode={async (code) => toOutcome(await gate.evaluate({ code }))}
      onClose={onClose}
    />
  );
}
