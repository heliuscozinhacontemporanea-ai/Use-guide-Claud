import { getSlotService } from '../factory';
import type { PublicSlot } from '../types/bookingTypes';

export async function listAvailableSlotsUseCase(
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<PublicSlot[]> {
  return getSlotService().listAvailableSlots(offerId, fromIso, toIso);
}
