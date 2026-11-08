import { getBookingArrivalService } from '../factory';
import type { Booking, BookingActor, BookingArrival } from '../types/bookingTypes';

/** "Cheguei" do horário: registra a chegada em cada reserva que ainda espera o cliente (D27). */
export async function recordSlotArrivalUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string,
  location?: BookingArrival['location']
): Promise<Booking[]> {
  return getBookingArrivalService().recordSlotArrival(actor, offerId, slotId, location);
}
