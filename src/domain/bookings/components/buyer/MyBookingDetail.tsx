import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalizeFirst } from '../../../../shared/utils/formatters';
import { placeTimeSuffix } from '../../../../shared/utils/placeTime';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import { StatusText } from '../../../../ui/components/StatusText';
import type { BookingSummary } from '../../types/bookings';
import { bookingReference } from '../../utils/bookingReference';
import { formatSlotDateTime, placeDateKey } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { serviceInProgress } from '../../utils/serviceInProgress';
import { BookingWhatsAppButton } from '../BookingWhatsAppButton';
import { BookingCheckInPass } from './BookingCheckInPass';

const CARD = 'rounded-card bg-surface border border-line';

/**
 * "Minha reserva" (print aprovado em 2026-11-10): situação, quando, o que foi reservado, ponto de
 * encontro, código de check-in (só no dia, com o aviso) e o contato com o parceiro (C2/B37). Abre
 * como página interna da folha do perfil, com o `<` e o título na barra fixa (D33).
 */
export function MyBookingDetail({ booking }: { booking: BookingSummary }) {
  const { t, i18n } = useTranslation();
  const [contactError, setContactError] = useState<string | null>(null);
  const tz = booking.offer.timeZone ?? undefined;
  const place = { timeZone: tz, city: booking.offer.city ?? undefined };
  const now = new Date();
  const today = placeDateKey(booking.offer.startsAt, tz) === placeDateKey(now.toISOString(), tz);
  const serviceEndMs =
    new Date(booking.offer.startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * 60_000;
  const confirmed = booking.status === 'confirmed';
  const inProgress = serviceInProgress(booking, now.getTime());
  const startedTime = booking.serviceStartedAt
    ? new Intl.DateTimeFormat(i18n.language, {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(booking.serviceStartedAt))
    : '';
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
      <div className="space-y-2">
        {/* Status é texto com ponto, nunca caixa com borda (DESIGN.md §2.2). */}
        <StatusText tone={confirmed ? 'success' : 'muted'}>
          {inProgress
            ? t('bookings.buyer.detail.inProgressSince', { time: startedTime })
            : t(`bookings.bookingStatus.${booking.status}`)}
          {confirmed && today && !inProgress && ` · ${t('bookings.buyer.detail.today')}`}
        </StatusText>
        <h3 className="font-display text-heading font-bold text-ink break-words">
          {booking.offer.title}
        </h3>
        {booking.businessName && booking.businessName !== booking.offer.title && (
          <p className="text-control text-ink-muted">{booking.businessName}</p>
        )}
      </div>

      <dl className={`${CARD} px-4 divide-y divide-line`}>
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 py-3 text-body">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="text-right text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {refundUntil && (
        <p className="flex items-start gap-2 text-meta text-info">
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
          <p className="px-1 text-meta text-ink-muted">{t('bookings.contact.partnerHint')}</p>
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
