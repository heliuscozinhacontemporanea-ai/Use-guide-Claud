import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function answerServiceConfirmationUseCase(
  bookingId: string,
  answer: 'yes' | 'no'
): Promise<BookingSummary> {
  return bookingsApi.answerServiceConfirmation(bookingId, answer);
}
