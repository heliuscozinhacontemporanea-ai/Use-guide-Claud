import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function markBookingDisputedUseCase(bookingId: string): Promise<Booking> {
  return getBookingService().markBookingDisputed(bookingId);
}
