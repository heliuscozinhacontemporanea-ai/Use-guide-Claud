import { getBookingServiceProofService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Tira o prazo de uma reserva cujo caso já foi resolvido por outro caminho (D20). */
export async function clearBookingDeadlineUseCase(
  bookingId: string,
  actorUid: string
): Promise<Booking> {
  return getBookingServiceProofService().clearDeadline(bookingId, actorUid);
}
