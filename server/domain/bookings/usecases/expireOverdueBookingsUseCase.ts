import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Devolve as vagas das reservas não pagas no prazo. Retorna as que expiraram nesta rodada. */
export async function expireOverdueBookingsUseCase(limit = 200): Promise<Booking[]> {
  return getBookingService().expireOverdueBookings(limit);
}
