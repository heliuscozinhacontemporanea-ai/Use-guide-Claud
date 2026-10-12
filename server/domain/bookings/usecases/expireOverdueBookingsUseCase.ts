import { getBookingService } from '../factory';

/** Devolve as vagas das reservas não pagas no prazo. Retorna quantas expiraram. */
export async function expireOverdueBookingsUseCase(limit = 200): Promise<number> {
  return getBookingService().expireOverdueBookings(limit);
}
