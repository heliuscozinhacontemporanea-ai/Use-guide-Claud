import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor, BookingServiceConfirmation } from '../types/bookingTypes';

/** Pergunta "O serviço aconteceu?" ainda aberta para o comprador (D20). */
export async function getPendingServiceConfirmationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking & { serviceConfirmation: BookingServiceConfirmation }> {
  return getBookingServiceProofService().getPendingConfirmation(actor, bookingId);
}
