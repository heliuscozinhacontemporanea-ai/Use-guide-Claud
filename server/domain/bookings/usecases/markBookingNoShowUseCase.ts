import { getBookingService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

export async function markBookingNoShowUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  return getBookingService().markBookingNoShow(actor, bookingId);
}
