import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { businessDateTimeToIso } from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { type EventOccurrence, postponePartnerEventOccurrenceUseCase } from '../../../events';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';

const MIN_REASON = 3;
const MAX_REASON = 300;

/** Adiar mantém a duração da sessão; o backend move os pedidos e o repasse para a nova data (D16). */
export function OccurrencePostponeDialog({
  eventListingId,
  occurrence,
  paidOrders,
  onClose,
  onDone,
}: {
  eventListingId: string;
  occurrence: EventOccurrence | null;
  paidOrders: number;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!occurrence) return;
    const startsAt = businessDateTimeToIso(when);
    if (
      !startsAt ||
      new Date(startsAt).getTime() <= Date.now() ||
      reason.trim().length < MIN_REASON
    ) {
      return setError(t('ticketSessions.postponeDialog.invalid'));
    }
    const duration =
      new Date(occurrence.endsAt).getTime() - new Date(occurrence.startsAt).getTime();
    const endsAt = new Date(new Date(startsAt).getTime() + Math.max(0, duration)).toISOString();
    setSending(true);
    setError(null);
    try {
      await postponePartnerEventOccurrenceUseCase(eventListingId, occurrence.id, {
        startsAt,
        endsAt,
        reason: reason.trim(),
      });
      onDone(t('ticketSessions.postponeDialog.done', { count: paidOrders }));
    } catch {
      setError(t('ticketSessions.failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={occurrence !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('ticketSessions.postponeDialog.title')}
      description={t('ticketSessions.postponeDialog.description')}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-when`} className="text-xs font-bold text-ink">
            {t('ticketSessions.postponeDialog.newStart')}
          </label>
          <input
            id={`${id}-when`}
            type="datetime-local"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            aria-describedby={`${id}-duration`}
            className={INPUT}
          />
          <p id={`${id}-duration`} className="text-[11px] text-ink/70">
            {t('ticketSessions.postponeDialog.durationKept')}
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
            {t('ticketSessions.postponeDialog.reason')}
          </label>
          <textarea
            id={`${id}-reason`}
            value={reason}
            maxLength={MAX_REASON}
            rows={3}
            onChange={(event) => setReason(event.target.value)}
            aria-describedby={`${id}-reason-hint`}
            className={`${INPUT} py-2`}
          />
          <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
            {t('ticketSessions.postponeDialog.reasonHint')}
          </p>
        </div>
        {error && (
          <p
            role="alert"
            className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className={`${BUTTON_PRIMARY} w-full flex items-center justify-center gap-2`}
        >
          {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {t('ticketSessions.postponeDialog.submit')}
        </button>
      </form>
    </Dialog>
  );
}
