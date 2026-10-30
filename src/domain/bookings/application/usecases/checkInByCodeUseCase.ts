import { bookingsApi } from '../../factory';
import type { UnitCheckInResult, CodeCheckInPayload } from '../../types/bookings';

export async function checkInByCodeUseCase(
  offerId: string,
  slotId: string,
  payload: CodeCheckInPayload
): Promise<UnitCheckInResult> {
  return bookingsApi.checkInByCode(offerId, slotId, payload);
}
