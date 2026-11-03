import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Reservas confirmadas que começam no intervalo, para os lembretes (D25). */
export function listConfirmedBookingsStartingBetweenUseCase(
  fromIso: string,
  toIso: string,
  limit = 200
): Promise<Booking[]> {
  return getBookingService().listConfirmedStartingBetween(fromIso, toIso, limit);
}
