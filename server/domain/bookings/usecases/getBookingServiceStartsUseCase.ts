import { getBookingArrivalService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Hora em que o prestador iniciou o serviço de cada reserva em andamento (C4), pelo ID da reserva. */
export async function getBookingServiceStartsUseCase(
  bookings: Booking[]
): Promise<Map<string, string>> {
  return getBookingArrivalService().serviceStartsFor(bookings);
}
