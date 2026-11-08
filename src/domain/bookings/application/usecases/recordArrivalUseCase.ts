import { bookingsApi } from '../../factory';
import type { ArrivalLocation, BookingSummary } from '../../types/bookings';

export async function recordArrivalUseCase(
  offerId: string,
  bookingId: string,
  location?: ArrivalLocation
): Promise<BookingSummary> {
  return bookingsApi.recordArrival(offerId, bookingId, location);
}
