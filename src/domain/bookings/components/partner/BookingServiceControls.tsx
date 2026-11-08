import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { BookingSummary, NoCodeReason } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { usesCheckInCode } from '../../utils/checkInPrefix';
import { formatSlotTime } from '../../utils/dates';
import { noShowAvailableAt } from '../../utils/serviceProofTiming';
import { NoCodeCheckInDialog } from './NoCodeCheckInDialog';

export interface ServiceControlActions {
  recordArrival: (bookingId: string) => Promise<boolean>;
  markNoShow: (bookingId: string) => Promise<void>;
  checkInWithoutCode: (bookingId: string, reason: NoCodeReason) => Promise<void>;
  answerAbsence: (bookingId: string, answer: 'was_there' | 'admitted') => Promise<void>;
}

/** O que o prestador faz numa reserva no dia do serviço (D20): Cheguei, ausência, sem código. */
export function BookingServiceControls({
  booking,
  actions,
  onNotice,
}: {
  booking: BookingSummary;
  actions: ServiceControlActions;
  onNotice: (message: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [noCode, setNoCode] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const time = (iso: string) => formatSlotTime(iso, i18n.language);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
    } catch (err: unknown) {
      onNotice(getBookingErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const [first] = booking.checkIns;
  if (first) {
    const total = booking.participantsCount;
    return (
      <StatusText tone={first.method === 'no_code' ? 'warn' : 'success'}>
        {first.method === 'no_code'
          ? t('serviceProof.partner.checkedInNoCode', { time: time(first.at) })
          : total > 1
            ? t('serviceProof.partner.checkedInUnits', {
                time: time(first.at),
                used: booking.checkIns.length,
                total,
              })
            : t('serviceProof.partner.checkedIn', { time: time(first.at) })}
      </StatusText>
    );
  }
  if (booking.status !== 'confirmed' || !usesCheckInCode(booking.kind)) return null;

  const absence = booking.providerAbsence;
  if (absence && !absence.resolution) {
    return (
      <div className="space-y-3 p-3 rounded-2xl bg-warn-soft">
        <p className="text-sm font-semibold text-warn">{t('serviceProof.partner.absenceTitle')}</p>
        <p className="text-[13px] text-ink/80">
          {t('serviceProof.partner.absenceMessage', {
            date: formatBusinessDateTime(absence.respondBy, i18n.language),
          })}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => actions.answerAbsence(booking.id, 'was_there'))}
            className={BUTTON_SECONDARY}
          >
            {t('serviceProof.partner.wasThere')}
          </button>
          <TextButton
            tone="danger"
            disabled={busy}
            onClick={() =>
              setConfirm({
                title: t('serviceProof.partner.admittedTitle'),
                message: t('serviceProof.partner.admittedMessage'),
                confirmLabel: t('serviceProof.partner.admittedConfirm'),
                tone: 'danger',
                onCancel: () => setConfirm(null),
                onConfirm: () => {
                  setConfirm(null);
                  void run(() => actions.answerAbsence(booking.id, 'admitted'));
                },
              })
            }
          >
            {t('serviceProof.partner.admitted')}
          </TextButton>
        </div>
        <ConfirmDialog data={confirm} />
      </div>
    );
  }

  const noShowAt = noShowAvailableAt(booking);
  const canNoShow = noShowAt !== null && noShowAt.getTime() <= Date.now();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {booking.arrivedAt ? (
          <StatusText tone="info">
            {t('serviceProof.partner.arrivedAt', { time: time(booking.arrivedAt) })}
          </StatusText>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const withLocation = await actions.recordArrival(booking.id);
                if (!withLocation) onNotice(t('serviceProof.partner.locationDenied'));
              })
            }
            className={`${BUTTON_SECONDARY} inline-flex items-center gap-1.5`}
          >
            <MapPin size={16} aria-hidden="true" />
            {t('serviceProof.partner.arrived')}
          </button>
        )}
        {canNoShow ? (
          <TextButton
            tone="danger"
            disabled={busy}
            onClick={() => void run(() => actions.markNoShow(booking.id))}
          >
            {t('serviceProof.partner.noShow')}
          </TextButton>
        ) : (
          noShowAt && (
            <span className="text-[13px] text-ink/60">
              {t('serviceProof.partner.noShowAt', { time: time(noShowAt.toISOString()) })}
            </span>
          )
        )}
        <TextButton tone="ink" disabled={busy} onClick={() => setNoCode(true)}>
          {t('serviceProof.partner.noCode')}
        </TextButton>
      </div>
      {noCode && (
        <NoCodeCheckInDialog
          onClose={() => setNoCode(false)}
          onConfirm={async (reason) => {
            await run(() => actions.checkInWithoutCode(booking.id, reason));
            setNoCode(false);
          }}
        />
      )}
    </div>
  );
}
