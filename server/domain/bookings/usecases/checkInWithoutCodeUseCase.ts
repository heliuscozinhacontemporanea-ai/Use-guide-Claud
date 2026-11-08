import { getBookingServiceProofService } from '../factory';
import type { CheckInWithoutCodeInput } from '../services/bookingServiceProofService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** "Cliente sem código": por conta e risco do prestador, até o comprador confirmar (D20). */
export async function checkInWithoutCodeUseCase(
  actor: BookingActor,
  input: CheckInWithoutCodeInput
): Promise<Booking> {
  return getBookingServiceProofService().checkInWithoutCode(actor, input);
}
