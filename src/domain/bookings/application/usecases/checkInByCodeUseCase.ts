import { bookingsApi } from '../../factory';
import type { BookingSummary, CodeCheckInPayload } from '../../types/bookings';

export async function checkInByCodeUseCase(
  offerId: string,
  slotId: string,
  payload: CodeCheckInPayload
): Promise<BookingSummary> {
  return bookingsApi.checkInByCode(offerId, slotId, payload);
}
