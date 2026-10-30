import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingProviderAbsence } from '../types/bookingTypes';

/** Grava a resposta e o desfecho do relato de ausência e tira o prazo (D20). */
export async function resolveProviderAbsenceUseCase(
  bookingId: string,
  outcome: Pick<BookingProviderAbsence, 'resolution' | 'answer'>,
  actorUid: string
): Promise<Booking> {
  return getBookingServiceProofService().resolveProviderAbsence(bookingId, outcome, actorUid);
}
