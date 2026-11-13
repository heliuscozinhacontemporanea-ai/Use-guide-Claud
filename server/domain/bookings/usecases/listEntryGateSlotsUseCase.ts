import { getBookingEntryService } from '../factory';
import type { BookingActor } from '../types/bookingTypes';

/** Horários de entrada de um lugar para quem opera a portaria: o dono ou a equipe ativa (C1). */
export function listEntryGateSlotsUseCase(
  actor: BookingActor,
  guideItemId: string,
  fromIso: string,
  toIso: string
) {
  return getBookingEntryService().listGateSlots(actor, guideItemId, fromIso, toIso);
}
