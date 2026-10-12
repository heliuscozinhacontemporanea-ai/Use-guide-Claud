import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Chamado só pelo webhook (fonte da verdade). Lança LATE_PAYMENT_REJECTED quando não dá para confirmar. */
export async function confirmBookingPaymentUseCase(
  bookingId: string,
  paymentIntentId: string
): Promise<Booking> {
  return getBookingService().confirmBookingPayment(bookingId, paymentIntentId);
}
