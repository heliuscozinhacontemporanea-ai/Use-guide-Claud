import { bookingsApi } from '../../factory';
import type { PartnerSlot } from '../../types/bookings';

export async function listPartnerSlotsUseCase(
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<PartnerSlot[]> {
  return bookingsApi.listPartnerSlots(offerId, fromIso, toIso);
}
