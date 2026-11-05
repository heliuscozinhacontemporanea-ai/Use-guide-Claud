import { getBookingArrivalService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** "Estou chegando" ou "Não vou mais" do cliente ao aviso "chegou" (D27). */
export async function respondToArrivalUseCase(
  actor: BookingActor,
  bookingId: string,
  response: 'coming' | 'not_going'
): Promise<Booking> {
  return getBookingArrivalService().respondToArrival(actor, bookingId, response);
}
