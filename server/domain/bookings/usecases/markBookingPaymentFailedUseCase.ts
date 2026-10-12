import { getBookingService } from '../factory';

export async function markBookingPaymentFailedUseCase(bookingId: string): Promise<void> {
  return getBookingService().markBookingPaymentFailed(bookingId);
}
