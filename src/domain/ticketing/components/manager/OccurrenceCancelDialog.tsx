import { AlertTriangle, Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { cancelPartnerEventOccurrenceUseCase, type EventOccurrence } from '../../../events';
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD } from './sessionButtons';

const MIN_REASON = 3;
const MAX_REASON = 300;

/**
 * Cancelar com pedidos pagos gera multa de 20% para o CNPJ (D14); a tela mostra a multa e oferece
 * adiar primeiro, que não tem multa (D16, 4A).
 */
export function OccurrenceCancelDialog({
  eventListingId,
  occurrence,
  paidOrders,
  onClose,
  onDone,
  onPostponeInstead,
}: {
  eventListingId: string;
  occurrence: EventOccurrence | null;
  paidOrders: number;
  onClose: () => void;
  onDone: (message: string) => void;
  onPostponeInstead: (occurrence: EventOccurrence) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!occurrence) return;
    if (reason.trim().length < MIN_REASON)
      return setError(t('ticketSessions.cancelDialog.invalid'));
    setSending(true);
    setError(null);
    try {
      await cancelPartnerEventOccurrenceUseCase(eventListingId, occurrence.id, reason.trim());
      onDone(t('ticketSessions.cancelDialog.done'));
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
      title={t('ticketSessions.cancelDialog.title')}
    >
      {occurrence && (
        <div className="space-y-4">
          {paidOrders > 0 ? (
            <>
              <p className="text-sm text-ink">
                {t('ticketSessions.cancelDialog.withSales', { count: paidOrders })}
              </p>
              <p className="flex items-start gap-2 p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                {t('ticketSessions.cancelDialog.penalty')}
              </p>
              <p className="text-xs text-ink/70">{t('ticketSessions.cancelDialog.forceMajeure')}</p>
            </>
          ) : (
            <p className="text-sm text-ink">{t('ticketSessions.cancelDialog.noSales')}</p>
          )}
          <div className="space-y-1.5">
            <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
              {t('ticketSessions.cancelDialog.reason')}
            </label>
            <textarea
              id={`${id}-reason`}
              value={reason}
              maxLength={MAX_REASON}
              rows={2}
              onChange={(event) => setReason(event.target.value)}
              aria-describedby={`${id}-reason-hint`}
              className={`${FIELD} py-2`}
            />
            <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
              {t('ticketSessions.cancelDialog.reasonHint')}
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={onClose} className={BUTTON_SECONDARY}>
              {t('ticketSessions.cancelDialog.back')}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => void confirm()}
              className={`${BUTTON_DANGER} flex items-center justify-center gap-2`}
            >
              {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {t('ticketSessions.cancelDialog.confirm')}
            </button>
            {paidOrders > 0 && (
              <button
                type="button"
                onClick={() => onPostponeInstead(occurrence)}
                className={BUTTON_PRIMARY}
              >
                {t('ticketSessions.cancelDialog.postponeInstead')}
              </button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
