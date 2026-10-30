import { bookingsApi } from '../../factory';
import type { UnitCheckInResult, EntryCheckInPayload } from '../../types/bookings';

export async function checkInEntryUseCase(
  offerId: string,
  slotId: string,
  payload: EntryCheckInPayload
): Promise<UnitCheckInResult> {
  return bookingsApi.checkInEntry(offerId, slotId, payload);
}
