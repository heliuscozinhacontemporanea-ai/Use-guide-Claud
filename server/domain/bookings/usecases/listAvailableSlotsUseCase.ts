import { getOfferService } from '../factory';
import type { PublicSlot } from '../types/bookingTypes';

export async function listAvailableSlotsUseCase(
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<PublicSlot[]> {
  return getOfferService().listAvailableSlots(offerId, fromIso, toIso);
}
