import { bookingsApi } from '../../factory';
import type { SlotContact } from '../../types/bookings';

export async function listSlotContactsUseCase(
  offerId: string,
  slotId: string
): Promise<SlotContact[]> {
  return bookingsApi.listSlotContacts(offerId, slotId);
}
