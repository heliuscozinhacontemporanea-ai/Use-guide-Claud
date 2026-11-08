import { getBookingEntryService } from '../factory';
import type { BookingActor } from '../types/bookingTypes';

/** Chaves públicas do QR da entrada, para a portaria validar sem internet (D20). */
export async function getEntryVerificationKeysUseCase(
  actor: BookingActor,
  offerId: string
): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
  return getBookingEntryService().getVerificationKeys(actor, offerId);
}
