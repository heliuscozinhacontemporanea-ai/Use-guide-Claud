import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../shared/utils/businessDateTime';
import { capitalizeFirst } from '../../../shared/utils/formatters';
import { Dialog } from '../../../ui/components/Dialog';
import { ListError, ListLoading } from '../../../ui/components/ListState';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { type EventOccurrence, useEventOccurrences } from '../../events';
import { usePartnerEventSales } from '../hooks/usePartnerEventSales';
import { OccurrenceCancelDialog } from './manager/OccurrenceCancelDialog';
import { OccurrencePostponeDialog } from './manager/OccurrencePostponeDialog';
import { OfflineSessionCard } from './manager/OfflineSessionCard';
import { SessionGateScreen, useSessionGate } from './manager/SessionGate';

const BLOCK = 'rounded-2xl bg-sheet-card border border-sheet-card-line';
const LINK =
  'press min-h-11 px-2 rounded-xl text-[14px] font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50';

function Lines({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className={`${BLOCK} p-4 space-y-2`}>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 text-[14px]">
          <dt className="text-ink/70">{label}</dt>
          <dd className="text-ink font-semibold text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Folha Portaria (p30): números, lista sem internet e o modo portaria. */
function GateSheet({
  occurrenceId,
  title,
  description,
  sold,
  courtesies,
  sales,
  onClose,
}: {
  occurrenceId: string;
  title: string;
  description: string;
  sold: number;
  courtesies: number;
  sales: ReturnType<typeof usePartnerEventSales>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { session, gate } = useSessionGate(occurrenceId, sales.performCheckIn, sales.reload);
  const [gateMode, setGateMode] = useState(false);
  const entered = sales.checkIns.length;
  return (
    <>
      <Dialog
        open={!gateMode}
        onOpenChange={(open) => !open && onClose()}
        title={t('ticketSessions.sheet.gateTitle')}
        description={`${title} · ${description}`}
      >
        <div className="space-y-4">
          <Lines
            rows={[
              [t('ticketSessions.sheet.soldTickets'), String(sold)],
              ...(courtesies > 0
                ? [[t('courtesy.tabs.guests'), String(courtesies)] as [string, string]]
                : []),
              [
                t('ticketSessions.sheet.entered'),
                // Convidados também entram pela portaria (D27).
                t('ticketSessions.sheet.enteredOf', { entered, total: sold + courtesies }),
              ],
            ]}
          />
          <OfflineSessionCard session={session} />
          <p className="px-1 text-[13px] text-ink/70">{t('ticketSessions.sheet.offlineHint')}</p>
          <button
            type="button"
            onClick={() => setGateMode(true)}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t('ticketSessions.sheet.openGateMode')}
          </button>
        </div>
      </Dialog>
      {gateMode && (
        <SessionGateScreen
          sessionLabel={`${title} · ${description}`}
          entries={entered}
          session={session}
          gate={gate}
          onClose={() => setGateMode(false)}
        />
      )}
    </>
  );
}

/**
 * Folha da sessão de evento no painel (p07): vendidos, entradas, portaria e as ações de adiar e
 * cancelar que já existem.
 */
export function PartnerSessionSheet({
  eventListingId,
  occurrenceId,
  title,
  sold,
  courtesies = 0,
  startAtGate = false,
  onClose,
  onChanged,
}: {
  eventListingId: string;
  occurrenceId: string;
  title: string;
  /** Ingressos vendidos e reservados, como a agenda mostra. */
  sold: number;
  /** Cortesias que ocupam lugar na sessão (D27). */
  courtesies?: number;
  /** Aberta pelo cartão de portaria de "Agora" (D27): começa na portaria. */
  startAtGate?: boolean;
  onClose: () => void;
  onChanged: (message?: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const occurrences = useEventOccurrences(eventListingId);
  const sales = usePartnerEventSales(eventListingId, occurrenceId);
  const [view, setView] = useState<'session' | 'gate' | 'postpone' | 'cancel'>(
    startAtGate ? 'gate' : 'session'
  );
  const occurrence: EventOccurrence | undefined = occurrences.occurrences.find(
    (item) => item.id === occurrenceId
  );
  const paidOrders = sales.orders.filter(
    (order) =>
      order.occurrenceId === occurrenceId &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  ).length;
  const description = occurrence
    ? capitalizeFirst(
        formatBusinessDate(occurrence.startsAt, i18n.language, {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        i18n.language
      )
    : '';
  const done = (message: string) => {
    onChanged(message);
    onClose();
  };

  if (view === 'gate') {
    return (
      <GateSheet
        occurrenceId={occurrenceId}
        title={title}
        description={description}
        sold={sold}
        courtesies={courtesies}
        sales={sales}
        onClose={() => (startAtGate ? onClose() : setView('session'))}
      />
    );
  }
  return (
    <>
      <Dialog
        open={view === 'session'}
        onOpenChange={(open) => !open && onClose()}
        title={title}
        description={description}
      >
        {occurrences.error ? (
          <ListError message={t('ticketSessions.sheet.error')} onRetry={occurrences.reload} />
        ) : !occurrence ? (
          <ListLoading label={title} />
        ) : (
          <div className="space-y-4">
            <Lines
              rows={[
                [
                  t('ticketSessions.sheet.sold'),
                  t('ticketSessions.sheet.enteredOf', {
                    entered: sold,
                    total: occurrence.capacity,
                  }),
                ],
                ...(courtesies > 0
                  ? [[t('courtesy.tabs.guests'), String(courtesies)] as [string, string]]
                  : []),
                [t('ticketSessions.sheet.entered'), String(sales.checkIns.length)],
              ]}
            />
            {occurrence.status === 'scheduled' && (
              <>
                <button
                  type="button"
                  onClick={() => setView('gate')}
                  className={`${BUTTON_PRIMARY} w-full`}
                >
                  {t('ticketSessions.sheet.openGate')}
                </button>
                <div className="flex justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setView('postpone')}
                    className={`${LINK} text-ink/80`}
                  >
                    {t('ticketSessions.sheet.postpone')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('cancel')}
                    className={`${LINK} text-danger`}
                  >
                    {t('ticketSessions.sheet.cancel')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Dialog>
      <OccurrencePostponeDialog
        eventListingId={eventListingId}
        occurrence={view === 'postpone' ? (occurrence ?? null) : null}
        paidOrders={paidOrders}
        onClose={() => setView('session')}
        onDone={done}
      />
      <OccurrenceCancelDialog
        eventListingId={eventListingId}
        occurrence={view === 'cancel' ? (occurrence ?? null) : null}
        paidOrders={paidOrders}
        onClose={() => setView('session')}
        onDone={done}
        onPostponeInstead={() => setView('postpone')}
      />
    </>
  );
}
