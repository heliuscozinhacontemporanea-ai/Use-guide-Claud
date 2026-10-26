import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import type { PartnerSlot } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatSlotDateTime, fortalezaInputToIso } from '../../utils/dates';
import { BUTTON_PRIMARY, INPUT } from '../shared/ListState';

const MIN_REASON = 3;
const MAX_REASON = 300;

export function SlotRescheduleDialog({
  slot,
  onClose,
  onSubmit,
}: {
  slot: PartnerSlot | null;
  onClose: () => void;
  onSubmit: (slot: PartnerSlot, change: { startsAt: string; reason: string }) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!slot) return;
    const startsAt = fortalezaInputToIso(when);
    if (
      !startsAt ||
      new Date(startsAt).getTime() <= Date.now() ||
      reason.trim().length < MIN_REASON
    ) {
      return setError(t('bookings.slots.rescheduleInvalid'));
    }
    setSending(true);
    setError(null);
    try {
      await onSubmit(slot, { startsAt, reason: reason.trim() });
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={slot !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('bookings.slots.rescheduleTitle')}
      description={t('bookings.slots.rescheduleDescription')}
    >
      {slot && (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <p className="text-xs font-bold text-ink/80">
            {formatSlotDateTime(slot.startsAt, i18n.language)}
          </p>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-when`} className="text-xs font-bold text-ink">
              {t('bookings.slots.newDateTime')}
            </label>
            <input
              id={`${id}-when`}
              type="datetime-local"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              aria-describedby={`${id}-tz`}
              className={INPUT}
            />
            <p id={`${id}-tz`} className="text-[11px] text-ink/70">
              {t('bookings.slots.timezoneNotice')}
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
              {t('bookings.slots.rescheduleReason')}
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
              {t('bookings.slots.rescheduleReasonHint')}
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
            {t('bookings.slots.rescheduleSubmit')}
          </button>
        </form>
      )}
    </Dialog>
  );
}
