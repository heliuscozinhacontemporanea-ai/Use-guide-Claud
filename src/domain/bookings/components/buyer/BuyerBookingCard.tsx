import { CalendarClock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import type { BookingSummary } from '../../types/bookings';
import { formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { BUTTON_SECONDARY } from '../shared/ListState';

export function BuyerBookingCard({
  booking,
  onCancel,
  claimAction,
}: {
  booking: BookingSummary;
  onCancel?: () => void;
  /** "Relatar problema", montado pela composição (D16, 2A). */
  claimAction?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const refundUntil =
    booking.status === 'confirmed'
      ? rescheduleRefundDeadline(booking.rescheduledAt, booking.offer.startsAt, new Date())
      : null;
  return (
    <li className="p-4 rounded-2xl bg-surface border border-line space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink break-words">{booking.offer.title}</p>
          <p className="text-xs text-ink/70">
            {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface border border-line text-ink/80">
          {t(`bookings.bookingStatus.${booking.status}`)}
        </span>
      </div>
      <p className="text-xs text-ink/70">
        {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
        {formatMinor(booking.totalMinor, i18n.language)}
      </p>
      {booking.offer.meetingPoint && (
        <p className="text-xs text-ink/70">
          {t('bookings.buyer.meetingPoint', { address: booking.offer.meetingPoint })}
        </p>
      )}
      {refundUntil && (
        <p className="px-3 py-2 rounded-xl border border-info-line bg-info-soft text-xs text-info flex items-start gap-2">
          <CalendarClock size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          {t('bookings.buyer.rescheduledNotice', {
            date: formatSlotDateTime(refundUntil, i18n.language),
          })}
        </p>
      )}
      {claimAction}
      {onCancel && (
        <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.cancelBooking')}
        </button>
      )}
    </li>
  );
}
