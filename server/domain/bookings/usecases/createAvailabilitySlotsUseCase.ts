import { getOfferService } from '../factory';
import type { CreateSlotsInput } from '../services/offerService';
import type { AvailabilitySlot, BookingActor } from '../types/bookingTypes';

/** Lista explícita ou recorrência no fuso America/Fortaleza; horários repetidos ou passados são ignorados. */
export async function createAvailabilitySlotsUseCase(
  actor: BookingActor,
  offerId: string,
  input: CreateSlotsInput
): Promise<AvailabilitySlot[]> {
  return getOfferService().createSlots(actor, offerId, input);
}
