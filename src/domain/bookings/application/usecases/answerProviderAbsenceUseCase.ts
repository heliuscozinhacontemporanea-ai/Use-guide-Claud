import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function answerProviderAbsenceUseCase(
  offerId: string,
  bookingId: string,
  answer: 'was_there' | 'admitted'
): Promise<BookingSummary> {
  return bookingsApi.answerProviderAbsence(offerId, bookingId, answer);
}
