import { bookingsApi } from '../../factory';
import type { BookingSummary, Page } from '../../types/bookings';

export async function listMyBookingsUseCase(cursor?: string | null): Promise<Page<BookingSummary>> {
  return bookingsApi.listMyBookings(cursor);
}
