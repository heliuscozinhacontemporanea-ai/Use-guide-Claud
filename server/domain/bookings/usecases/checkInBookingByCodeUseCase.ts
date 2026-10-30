import { getBookingCheckInService } from '../factory';
import type { CheckInByCodeInput, UnitCheckInResult } from '../services/bookingCheckInService';
import type { BookingActor } from '../types/bookingTypes';

/** Check-in de uma unidade pelo dono da oferta, com o código que o cliente informa (D20). */
export async function checkInBookingByCodeUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<UnitCheckInResult> {
  return getBookingCheckInService().checkInByCode(actor, input);
}
