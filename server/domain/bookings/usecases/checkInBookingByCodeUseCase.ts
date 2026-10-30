import { getBookingCheckInService } from '../factory';
import type { CheckInByCodeInput } from '../services/bookingCheckInService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Check-in pelo dono da oferta com o código que o comprador informa na hora do serviço (D20). */
export async function checkInBookingByCodeUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<Booking> {
  return getBookingCheckInService().checkInByCode(actor, input);
}
