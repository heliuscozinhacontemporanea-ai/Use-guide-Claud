import { bookingsApi } from '../../factory';
import type { PublicSlot } from '../../types/bookings';

export async function listAvailableSlotsUseCase(
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<PublicSlot[]> {
  return bookingsApi.listAvailableSlots(offerId, fromIso, toIso);
}
