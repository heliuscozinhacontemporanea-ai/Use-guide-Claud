import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor, BookingArrival } from '../types/bookingTypes';

/** "Cheguei" do prestador, com a localização quando o navegador permite (D20). */
export async function recordProviderArrivalUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string,
  location?: BookingArrival['location']
): Promise<Booking> {
  return getBookingServiceProofService().recordArrival(actor, offerId, bookingId, location);
}
