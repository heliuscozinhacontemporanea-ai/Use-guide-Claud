import { bookingsApi } from '../../factory';
import type { ArrivalResponse, BookingSummary } from '../../types/bookings';

export async function respondToArrivalUseCase(
  bookingId: string,
  response: ArrivalResponse
): Promise<BookingSummary> {
  return bookingsApi.respondToArrival(bookingId, response);
}
