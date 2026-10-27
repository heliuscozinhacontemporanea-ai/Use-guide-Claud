import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventOccurrence } from '../../../events';
import { OccurrenceCancelDialog } from './OccurrenceCancelDialog';
import { OccurrencePostponeDialog } from './OccurrencePostponeDialog';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';

/** Adiar ou cancelar a sessão escolhida; sessão já adiada ou cancelada só mostra o status. */
export function SessionActions({
  eventListingId,
  occurrence,
  paidOrders,
  onChanged,
}: {
  eventListingId: string;
  occurrence: EventOccurrence | undefined;
  paidOrders: number;
  onChanged: (message: string) => void;
}) {
  const { t } = useTranslation();
  const [postponing, setPostponing] = useState<EventOccurrence | null>(null);
  const [canceling, setCanceling] = useState<EventOccurrence | null>(null);
  if (!occurrence) return null;

  const done = (message: string) => {
    setPostponing(null);
    setCanceling(null);
    onChanged(message);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {occurrence.status === 'scheduled' ? (
        <>
          <button
            type="button"
            onClick={() => setPostponing(occurrence)}
            className={BUTTON_SECONDARY}
          >
            {t('ticketSessions.postpone')}
          </button>
          <button
            type="button"
            onClick={() => setCanceling(occurrence)}
            className={BUTTON_SECONDARY}
          >
            {t('ticketSessions.cancel')}
          </button>
        </>
      ) : occurrence.status === 'postponed' || occurrence.status === 'canceled' ? (
        <span className="px-2.5 py-1 rounded-full border border-line bg-surface text-[11px] font-bold text-ink/80">
          {t(
            occurrence.status === 'postponed'
              ? 'ticketSessions.statusPostponed'
              : 'ticketSessions.statusCanceled'
          )}
        </span>
      ) : null}
      {/* As chaves recriam os formulários vazios para cada sessão. */}
      <OccurrencePostponeDialog
        key={`postpone-${postponing?.id ?? 'none'}`}
        eventListingId={eventListingId}
        occurrence={postponing}
        paidOrders={paidOrders}
        onClose={() => setPostponing(null)}
        onDone={done}
      />
      <OccurrenceCancelDialog
        key={`cancel-${canceling?.id ?? 'none'}`}
        eventListingId={eventListingId}
        occurrence={canceling}
        paidOrders={paidOrders}
        onClose={() => setCanceling(null)}
        onDone={done}
        onPostponeInstead={(selected) => {
          setCanceling(null);
          setPostponing(selected);
        }}
      />
    </div>
  );
}
