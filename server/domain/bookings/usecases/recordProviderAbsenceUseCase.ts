import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Grava o relato de ausência do prestador e o prazo de 2 h para ele responder (D20). */
export async function recordProviderAbsenceUseCase(
  actor: BookingActor,
  bookingId: string,
  claimId: string
): Promise<Booking> {
  return getBookingServiceProofService().recordProviderAbsence(actor, bookingId, claimId);
}
