import { getBookingArrivalService } from '../factory';
import type { AvailabilitySlot, BookingActor } from '../types/bookingTypes';

/** "Iniciar serviço" do horário (C4): grava o início uma vez só e devolve o horário. */
export async function startSlotServiceUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<AvailabilitySlot> {
  return getBookingArrivalService().startSlotService(actor, offerId, slotId);
}
