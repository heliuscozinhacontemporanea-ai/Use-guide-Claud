import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor, BookingProviderAbsence } from '../types/bookingTypes';

/** Relato de ausência ainda aberto na oferta do prestador (D20). */
export async function getOpenProviderAbsenceUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string
): Promise<Booking & { providerAbsence: BookingProviderAbsence }> {
  return getBookingServiceProofService().getOpenProviderAbsence(actor, offerId, bookingId);
}
