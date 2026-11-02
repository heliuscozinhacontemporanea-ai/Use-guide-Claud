import { bookingsApi } from '../../factory';
import type { CodeCheckInPayload, UnitCheckInResult } from '../../types/bookings';

export async function checkInByCodeUseCase(
  offerId: string,
  slotId: string,
  payload: CodeCheckInPayload
): Promise<UnitCheckInResult> {
  return bookingsApi.checkInByCode(offerId, slotId, payload);
}
