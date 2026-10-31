import { ScanLine } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CHECK_IN_ALPHABET } from '../../../../shared/constants/checkInCode';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { GateModeScreen, type GateOutcome } from '../../../../ui/components/GateModeScreen';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { useOfflineTicketSession } from '../../hooks/useOfflineTicketSession';
import type { usePartnerEventSales } from '../../hooks/usePartnerEventSales';
import { useTicketGate } from '../../hooks/useTicketGate';
import type { EventCheckIn } from '../../types/ticketing';
import { TICKET_CODE_LENGTH, TICKET_CODE_PREFIX } from '../../utils/ticketCode';
import { OfflineSessionCard } from './OfflineSessionCard';
import { TicketGateCard } from './TicketGateCard';

/** Aba de check-in do evento: portaria, sessão sem internet e entradas já feitas. */
export function CheckInTab({
  occurrenceId,
  sessionLabel,
  checkIns,
  performCheckIn,
  reloadSales,
}: {
  occurrenceId: string;
  /** Nome do evento e horário da sessão, no topo do modo portaria. */
  sessionLabel: string;
  checkIns: EventCheckIn[];
  performCheckIn: ReturnType<typeof usePartnerEventSales>['performCheckIn'];
  reloadSales: () => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation();
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
  const [gateMode, setGateMode] = useState(false);

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
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setGateMode(true)}
        disabled={!occurrenceId}
        className={`${BUTTON_PRIMARY} w-full inline-flex items-center justify-center gap-2`}
      >
        <ScanLine size={18} aria-hidden="true" />
        {t('gateMode.open')}
      </button>
      {gateMode && (
        <GateModeScreen
          title={sessionLabel}
          stats={t('ticketGate.entries', { count: checkIns.length })}
          online={session.isOnline}
          codePrefix={TICKET_CODE_PREFIX}
          codeLength={TICKET_CODE_LENGTH}
          codeAlphabet={CHECK_IN_ALPHABET}
          onQr={async (qrToken) => toOutcome(await gate.evaluate({ qrToken }))}
          onCode={async (code) => toOutcome(await gate.evaluate({ code }))}
          onClose={() => setGateMode(false)}
        />
      )}
      <TicketGateCard gate={gate} />
      <OfflineSessionCard session={session} />
      {checkIns.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink">{t('ticketGate.recent')}</h3>
          <ul className="space-y-2">
            {checkIns.map((checkIn) => (
              <li
                key={checkIn.id}
                className="p-3 rounded-xl bg-surface border border-line flex flex-wrap items-center justify-between gap-2 text-[13px]"
              >
                <span className="text-ink">
                  {t('ticketGate.ticketRef', { id: checkIn.ticketId.slice(0, 8) })}
                  <span className="text-ink/70">
                    {' · '}
                    {t(
                      checkIn.method === 'offline_sync'
                        ? 'ticketGate.method.offline'
                        : 'ticketGate.method.online'
                    )}
                  </span>
                </span>
                <span className="text-ink/70">
                  {formatBusinessDateTime(checkIn.checkedInAt, i18n.language)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
