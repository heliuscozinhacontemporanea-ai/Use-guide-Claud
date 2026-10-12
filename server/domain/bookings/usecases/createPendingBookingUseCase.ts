import { getBookingService } from '../factory';
import type { CreatePendingBookingInput } from '../services/bookingService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Reserva as vagas por 15 min. A mesma chave de idempotência devolve a mesma reserva. */
export async function createPendingBookingUseCase(
  actor: BookingActor,
  input: CreatePendingBookingInput,
  platformFeePercent: number
): Promise<Booking> {
  return getBookingService().createPendingBooking(actor, input, platformFeePercent);
}
