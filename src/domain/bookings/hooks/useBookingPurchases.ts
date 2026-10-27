import { createElement } from 'react';
import { Compass, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDay } from '../../../shared/utils/businessDateTime';
import type { PurchaseEntry } from '../../../ui/components/purchases/purchaseEntry';
import type { StatusTone } from '../../../ui/components/StatusText';
import type { BookingSummary } from '../types/bookings';
import { bookingPurchaseSection, isBookingAwaitingPayment } from '../utils/bookingPurchaseSection';
import { formatMinor } from '../utils/money';
import { useMyBookings } from './useMyBookings';

// Código curto da reserva para o atendimento; o ID completo continua no backend.
export const BOOKING_CODE_LENGTH = 10;

const DONE_STATUS: Partial<Record<BookingSummary['status'], { tone: StatusTone; key: string }>> = {
  confirmed: { tone: 'success', key: 'paid' },
  completed: { tone: 'success', key: 'paid' },
  no_show: { tone: 'danger', key: 'noShow' },
  disputed: { tone: 'warn', key: 'disputed' },
};

/** Reservas do comprador como linhas do histórico de Compras. */
export function useBookingPurchases() {
  const { t, i18n } = useTranslation();
  const bookings = useMyBookings();
  const now = new Date();

  const statusOf = (booking: BookingSummary): { tone: StatusTone; text: string } => {
    const done = DONE_STATUS[booking.status];
    if (done) return { tone: done.tone, text: t(`purchases.status.${done.key}`) };
    if (isBookingAwaitingPayment(booking, now)) {
      return {
        tone: 'warn',
        text: booking.expiresAt
          ? t('purchases.status.awaitingPayment', {
              time: formatBusinessDate(booking.expiresAt, i18n.language, { timeStyle: 'short' }),
            })
          : t('purchases.status.awaitingPaymentNoTime'),
      };
    }
    const refund = booking.cancellation?.refundAmountMinor ?? 0;
    if (booking.cancellation?.by === 'partner') {
      // Cancelamento pelo proprietário devolve sempre o valor inteiro (D14).
      return { tone: 'muted', text: t('purchases.status.canceledByPartner') };
    }
    if (refund > 0) {
      return {
        tone: 'muted',
        text: t('purchases.status.refundedAmount', { amount: formatMinor(refund, i18n.language) }),
      };
    }
    return { tone: 'muted', text: t('purchases.status.notCompleted') };
  };

  const entryOf = (booking: BookingSummary): PurchaseEntry => {
    const section = bookingPurchaseSection(booking, now);
    return {
      key: `booking:${booking.id}`,
      section,
      icon: createElement(booking.kind === 'private_entry' ? Ticket : Compass, {
        size: 18,
        'aria-hidden': true,
      }),
      title: booking.offer.title,
      code: booking.id.slice(0, BOOKING_CODE_LENGTH),
      purchasedAt: booking.createdAt,
      serviceLine: t(`purchases.service.${booking.kind}`, {
        date: formatBusinessDay(booking.offer.startsAt, i18n.language),
      }),
      amountMinor: booking.totalMinor,
      struck: section === 'canceled',
      status: statusOf(booking),
    };
  };

  return { ...bookings, entries: bookings.data.map(entryOf) };
}

export type BookingPurchasesSource = ReturnType<typeof useBookingPurchases>;
