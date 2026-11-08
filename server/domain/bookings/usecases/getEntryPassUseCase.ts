import { getBookingEntryService } from '../factory';
import type { EntryPassView } from '../services/bookingEntryService';
import type { BookingActor } from '../types/bookingTypes';

/** QR assinado e código de 8 caracteres da entrada de atração, para o comprador (D20). */
export async function getEntryPassUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<EntryPassView> {
  return getBookingEntryService().getEntryPass(actor, bookingId);
}
