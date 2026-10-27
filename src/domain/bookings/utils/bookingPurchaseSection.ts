import type { PurchaseSection } from '../../../ui/components/purchases/purchaseEntry';
import type { BookingSummary } from '../types/bookings';

const DONE = new Set<BookingSummary['status']>(['confirmed', 'completed', 'no_show', 'disputed']);

/** Reserva ainda dentro da janela de pagamento. */
export function isBookingAwaitingPayment(booking: BookingSummary, now: Date): boolean {
  return (
    booking.status === 'pending_payment' &&
    (!booking.expiresAt || new Date(booking.expiresAt).getTime() > now.getTime())
  );
}

/** Seção da reserva no histórico de Compras: paga, esperando pagamento ou sem cobrança/devolvida. */
export function bookingPurchaseSection(booking: BookingSummary, now: Date): PurchaseSection {
  if (DONE.has(booking.status)) return 'done';
  return isBookingAwaitingPayment(booking, now) ? 'pending' : 'canceled';
}
