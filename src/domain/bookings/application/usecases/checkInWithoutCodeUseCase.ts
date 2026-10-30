import { bookingsApi } from '../../factory';
import type { BookingSummary, NoCodeReason } from '../../types/bookings';

export async function checkInWithoutCodeUseCase(
  offerId: string,
  bookingId: string,
  payload: { participantsPresent: number; reason: NoCodeReason }
): Promise<BookingSummary> {
  return bookingsApi.checkInWithoutCode(offerId, bookingId, payload);
}
