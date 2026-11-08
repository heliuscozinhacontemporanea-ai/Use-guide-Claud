import { getBookingCheckInService } from '../factory';
import type { CheckInCodeView } from '../services/bookingCheckInService';
import type { BookingActor } from '../types/bookingTypes';

/** Código de check-in do comprador, visível a partir das 00:00 do dia do serviço (D20). */
export async function getBookingCheckInCodeUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<CheckInCodeView> {
  return getBookingCheckInService().getCheckInCode(actor, bookingId);
}
