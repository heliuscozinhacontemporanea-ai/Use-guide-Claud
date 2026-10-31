import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { useOfflineTicketSession } from '../../hooks/useOfflineTicketSession';
import type { usePartnerEventSales } from '../../hooks/usePartnerEventSales';
import { useTicketGate } from '../../hooks/useTicketGate';
import type { EventCheckIn } from '../../types/ticketing';
import { OfflineSessionCard } from './OfflineSessionCard';
import { TicketGateCard } from './TicketGateCard';

/** Aba de check-in do evento: portaria, sessão sem internet e entradas já feitas. */
export function CheckInTab({
  occurrenceId,
  checkIns,
  performCheckIn,
  reloadSales,
}: {
  occurrenceId: string;
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

  return (
    <div className="space-y-4">
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
