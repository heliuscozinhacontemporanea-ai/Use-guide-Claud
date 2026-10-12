import { getBookingService } from '../factory';
import type { BookingDetails } from '../services/bookingService';
import type { BookingActor } from '../types/bookingTypes';

/** Comprador, parceiro vendedor ou admin; para qualquer outro a reserva não existe. */
export async function getBookingForActorUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<BookingDetails> {
  return getBookingService().getBookingForActor(actor, bookingId);
}
