import { bookingsApi } from '../../factory';
import type { BookingSummary, EntryCheckInPayload } from '../../types/bookings';

export async function checkInEntryUseCase(
  offerId: string,
  slotId: string,
  payload: EntryCheckInPayload
): Promise<BookingSummary> {
  return bookingsApi.checkInEntry(offerId, slotId, payload);
}
