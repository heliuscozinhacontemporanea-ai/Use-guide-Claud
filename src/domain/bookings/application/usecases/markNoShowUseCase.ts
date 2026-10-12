import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function markNoShowUseCase(bookingId: string): Promise<BookingSummary> {
  return bookingsApi.markNoShow(bookingId);
}
