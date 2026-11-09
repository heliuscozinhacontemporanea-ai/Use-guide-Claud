import { getBookingService } from '../factory';
import type { BookingContactTarget } from '../services/bookingService';
import type { BookingActor } from '../types/bookingTypes';

/** Contato depois da compra (C2/B37): reserva confirmada, até o fim do serviço, com auditoria. */
export function openBookingContactUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<BookingContactTarget> {
  return getBookingService().openContact(actor, bookingId);
}
