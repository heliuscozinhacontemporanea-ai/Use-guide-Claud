import { getSlotService } from '../factory';
import type { AvailabilitySlot, BookingActor } from '../types/bookingTypes';

export async function listOfferSlotsForPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<AvailabilitySlot[]> {
  return getSlotService().listOfferSlotsForOwner(actor, offerId, fromIso, toIso);
}
