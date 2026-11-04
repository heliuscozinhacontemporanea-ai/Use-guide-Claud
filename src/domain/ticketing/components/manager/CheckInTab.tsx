import { ScanLine } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { usePartnerEventSales } from '../../hooks/usePartnerEventSales';
import type { EventCheckIn } from '../../types/ticketing';
import { OfflineSessionCard } from './OfflineSessionCard';
import { SessionGateScreen, useSessionGate } from './SessionGate';
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
  const { session, gate } = useSessionGate(occurrenceId, performCheckIn, reloadSales);
  const [gateMode, setGateMode] = useState(false);

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
        <SessionGateScreen
          sessionLabel={sessionLabel}
          entries={checkIns.length}
          session={session}
          gate={gate}
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
