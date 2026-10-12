import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function cancelPendingBookingUseCase(
  bookingId: string,
  reason: string
): Promise<Booking> {
  return getBookingService().cancelPendingBooking(bookingId, reason);
}
