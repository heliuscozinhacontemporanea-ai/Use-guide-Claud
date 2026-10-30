import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function reportProviderAbsentUseCase(bookingId: string): Promise<BookingSummary> {
  return bookingsApi.reportProviderAbsent(bookingId);
}
