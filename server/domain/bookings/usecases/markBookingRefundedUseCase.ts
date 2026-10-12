import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function markBookingRefundedUseCase(bookingId: string): Promise<Booking> {
  return getBookingService().markBookingRefunded(bookingId);
}
