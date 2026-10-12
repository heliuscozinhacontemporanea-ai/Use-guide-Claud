import { bookingsApi } from '../../factory';
import type { BookingSummary, Page } from '../../types/bookings';

export async function listOfferBookingsUseCase(
  offerId: string,
  cursor?: string | null
): Promise<Page<BookingSummary>> {
  return bookingsApi.listOfferBookings(offerId, cursor);
}
