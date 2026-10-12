import { getBookingService } from '../factory';
import type { PageRequest } from '../ports/bookingsPort';
import type { Booking, BookingActor, Page } from '../types/bookingTypes';

export async function listMyBookingsUseCase(
  actor: BookingActor,
  page: PageRequest
): Promise<Page<Booking>> {
  return getBookingService().listBuyerBookings(actor, page);
}
