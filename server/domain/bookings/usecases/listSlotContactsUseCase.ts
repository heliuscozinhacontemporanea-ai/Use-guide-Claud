import { getBookingArrivalService } from '../factory';
import type { SlotContact } from '../services/bookingArrivalService';
import type { BookingActor } from '../types/bookingTypes';

/** Telefones de quem ainda não chegou, depois do "Cheguei" e até o fim do horário (D27). */
export async function listSlotContactsUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<SlotContact[]> {
  return getBookingArrivalService().listSlotContacts(actor, offerId, slotId);
}
