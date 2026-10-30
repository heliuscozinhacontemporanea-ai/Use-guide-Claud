import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingServiceConfirmation } from '../types/bookingTypes';

/** Grava a resposta ou o desfecho da pergunta "O serviço aconteceu?" e tira o prazo (D20). */
export async function resolveServiceConfirmationUseCase(
  bookingId: string,
  outcome: Pick<BookingServiceConfirmation, 'answer' | 'claimId' | 'resolution'>,
  actorUid: string
): Promise<Booking> {
  return getBookingServiceProofService().resolveServiceConfirmation(bookingId, outcome, actorUid);
}
