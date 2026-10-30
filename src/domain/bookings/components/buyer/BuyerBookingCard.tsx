import { CalendarClock, Compass, MapPin, Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
import type { BookingStatus, BookingSummary } from '../../types/bookings';
import { BookingCheckInPass } from './BookingCheckInPass';
import { formatSlotDateTime, fortalezaDateKey } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { formatBusinessWeekday } from '../../../../shared/utils/businessDateTime';

const STATUS_TONE: Partial<Record<BookingStatus, StatusTone>> = {
  pending_payment: 'warn',
  canceled: 'muted',
  refunded: 'muted',
  expired: 'muted',
  no_show: 'danger',
  disputed: 'warn',
};

/**
 * Cartão de reserva do comprador (D17): o que foi comprado e quando, e uma linha só com o que a
 * pessoa precisa saber agora.
 */
export function BuyerBookingCard({
  booking,
  upcoming,
}: {
  booking: BookingSummary;
  upcoming: boolean;
}) {
  const { t, i18n } = useTranslation();
  const Icon = booking.kind === 'private_entry' ? Ticket : Compass;
  const refundUntil =
    booking.status === 'confirmed'
      ? rescheduleRefundDeadline(booking.rescheduledAt, booking.offer.startsAt, new Date())
      : null;
  const price = formatMinor(booking.totalMinor, i18n.language);
  const statusTone = STATUS_TONE[booking.status];
  const refund = booking.cancellation?.refundAmountMinor ?? 0;

  const footer: ReactNode = statusTone ? (
    <StatusText tone={statusTone}>
      {refund > 0
        ? t('bookings.buyer.refundedAmount', { amount: formatMinor(refund, i18n.language) })
        : t(`bookings.bookingStatus.${booking.status}`)}
    </StatusText>
  ) : upcoming ? (
    booking.offer.meetingPoint && (
      <span className="min-w-0 inline-flex items-center gap-1.5 text-[13px] text-ink/70">
        <MapPin size={15} className="shrink-0" aria-hidden="true" />
        <span className="truncate">{booking.offer.meetingPoint}</span>
      </span>
    )
  ) : (
    <StatusText tone="muted">{t(`bookings.bookingStatus.${booking.status}`)}</StatusText>
  );

  return (
    <li className="p-4 rounded-[20px] bg-surface border border-line">
      <div className="flex gap-3">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
          <Icon size={22} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug break-words">
            {booking.offer.title}
          </p>
          {booking.businessName && (
            <p className="text-[13px] text-ink/70 truncate">{booking.businessName}</p>
          )}
          <p className="text-sm text-ink/70 mt-0.5">
            {upcoming
              ? `${formatSlotDateTime(booking.offer.startsAt, i18n.language)} · ${t(
                  booking.sellingUnit === 'group'
                    ? 'serviceProof.units.groups'
                    : 'bookings.bookingsList.participants',
                  { count: booking.participantsCount }
                )}`
              : `${formatBusinessWeekday(booking.offer.startsAt, i18n.language)} · ${price}`}
          </p>
        </div>
      </div>
      {refundUntil && (
        <p className="mt-3 flex items-start gap-2 text-[13px] text-info">
          <CalendarClock size={16} className="shrink-0 mt-px" aria-hidden="true" />
          {t('bookings.buyer.rescheduledNotice', {
            date: formatBusinessWeekday(refundUntil, i18n.language),
          })}
        </p>
      )}
      {/* Códigos ou entradas da reserva paga, até o check-in de todas, também durante o serviço (D20). */}
      {booking.status === 'confirmed' &&
        booking.checkIns.length < booking.participantsCount &&
        (upcoming ||
          fortalezaDateKey(booking.offer.startsAt) ===
            fortalezaDateKey(new Date().toISOString())) && (
          <div className="mt-3 pt-3 border-t border-line">
            <BookingCheckInPass booking={booking} />
          </div>
        )}
      {footer && <div className="mt-3 pt-3 border-t border-line">{footer}</div>}
    </li>
  );
}
