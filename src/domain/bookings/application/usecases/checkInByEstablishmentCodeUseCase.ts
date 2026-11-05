import { bookingsApi } from '../../factory';
import type { CodeCheckInPayload, EstablishmentCheckInResult } from '../../types/bookings';

export async function checkInByEstablishmentCodeUseCase(
  guideItemId: string,
  payload: CodeCheckInPayload
): Promise<EstablishmentCheckInResult> {
  return bookingsApi.checkInByEstablishmentCode(guideItemId, payload);
}
