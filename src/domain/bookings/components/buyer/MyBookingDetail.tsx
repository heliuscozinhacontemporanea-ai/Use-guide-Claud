import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalizeFirst } from '../../../../shared/utils/formatters';
import { placeTimeSuffix } from '../../../../shared/utils/placeTime';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import { BackButton } from '../../../../ui/components/BackButton';
import { StatusText } from '../../../../ui/components/StatusText';
import type { BookingSummary } from '../../types/bookings';
import { bookingReference } from '../../utils/bookingReference';
import { formatSlotDateTime, placeDateKey } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { BookingWhatsAppButton } from '../BookingWhatsAppButton';
import { BookingCheckInPass } from './BookingCheckInPass';

const CARD = 'rounded-[20px] bg-surface border border-line';

/**
 * "Minha reserva" (print aprovado em 2026-11-10): situação, quando, o que foi reservado, ponto de
 * encontro, código de check-in (só no dia, com o aviso) e o contato com o parceiro (C2/B37).
 */
export function MyBookingDetail({
  booking,
  onBack,
}: {
  booking: BookingSummary;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [contactError, setContactError] = useState<string | null>(null);
  const tz = booking.offer.timeZone ?? undefined;
  const place = { timeZone: tz, city: booking.offer.city ?? undefined };
  const now = new Date();
  const today = placeDateKey(booking.offer.startsAt, tz) === placeDateKey(now.toISOString(), tz);
  const serviceEndMs =
    new Date(booking.offer.startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * 60_000;
  const confirmed = booking.status === 'confirmed';
  const canContact = confirmed && now.getTime() <= serviceEndMs;
  const showPass =
    confirmed &&
    booking.checkIns.length < booking.participantsCount &&
    now.getTime() <= serviceEndMs;
  const refundUntil = confirmed
    ? rescheduleRefundDeadline(booking.rescheduledAt, booking.offer.startsAt, now)
    : null;
  const refund = booking.cancellation?.refundAmountMinor ?? 0;
  const when = today
    ? `${capitalizeFirst(t('bookings.buyer.today'), i18n.language)} · ${new Intl.DateTimeFormat(i18n.language, { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date(booking.offer.startsAt))}`
    : formatSlotDateTime(booking.offer.startsAt, i18n.language, tz);
  const units = t(
    booking.sellingUnit === 'group'
      ? 'serviceProof.units.groups'
      : 'bookings.bookingsList.participants',
    { count: booking.participantsCount }
  );
  const rows: Array<[string, string]> = [
    [
      t('bookings.buyer.detail.whenLabel'),
      `${when}${placeTimeSuffix(t, place, booking.offer.startsAt)}`,
    ],
    [t('bookings.buyer.detail.bookingLabel'), units],
    ...(booking.offer.meetingPoint
      ? [[t('bookings.buyer.detail.meetingLabel'), booking.offer.meetingPoint] as [string, string]]
      : []),
  ];

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <BackButton label={t('bookings.buyer.back')} onClick={onBack} />
        <h2 className="text-[20px] font-display font-bold text-ink">
          {t('bookings.buyer.detail.bookingTitle')}
        </h2>
      </div>
      <div className="space-y-2">
        <span
          className={
            confirmed
              ? 'inline-flex items-center gap-1.5 rounded-full border border-success-line bg-success-soft px-3 py-1 text-[13px] font-semibold text-success'
              : 'inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-semibold text-ink/75'
          }
        >
          {confirmed && <span aria-hidden="true">●</span>}
          {t(`bookings.bookingStatus.${booking.status}`)}
          {confirmed && today && ` · ${t('bookings.buyer.detail.today')}`}
        </span>
        <h3 className="font-display text-[24px] font-bold text-ink leading-tight break-words">
          {booking.offer.title}
        </h3>
        {booking.businessName && booking.businessName !== booking.offer.title && (
          <p className="text-[14px] text-ink/70">{booking.businessName}</p>
        )}
      </div>

      <dl className={`${CARD} px-4 divide-y divide-line`}>
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 py-3 text-[15px]">
            <dt className="text-ink/70">{label}</dt>
            <dd className="text-right text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {refundUntil && (
        <p className="flex items-start gap-2 text-[13px] text-info">
          <CalendarClock size={16} className="shrink-0 mt-px" aria-hidden="true" />
          {t('bookings.buyer.rescheduledNotice', {
            date: formatSlotDateTime(refundUntil, i18n.language, tz),
          })}
        </p>
      )}

      {showPass && <BookingCheckInPass booking={booking} />}

      {canContact && (
        <div className="space-y-2">
          <BookingWhatsAppButton
            bookingId={booking.id}
            label={t('bookings.contact.partnerButton')}
            message={t('bookings.contact.toPartner', {
              code: bookingReference(booking.id),
              title: booking.offer.title,
              when: formatSlotDateTime(booking.offer.startsAt, i18n.language, tz),
            })}
            onError={setContactError}
          />
          <p className="px-1 text-[13px] text-ink/70">{t('bookings.contact.partnerHint')}</p>
          {contactError && <StatusText tone="warn">{contactError}</StatusText>}
        </div>
      )}

      {refund > 0 && (
        <StatusText tone="muted">
          {t('bookings.buyer.refundedAmount', { amount: formatMinor(refund, i18n.language) })}
        </StatusText>
      )}
    </section>
  );
}
