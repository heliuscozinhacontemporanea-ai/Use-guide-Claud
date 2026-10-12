import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Leitura interna (webhook, jobs). Rotas HTTP usam getBookingForActorUseCase. */
export async function getBookingUseCase(bookingId: string): Promise<Booking | null> {
  return getBookingService().getBooking(bookingId);
}
