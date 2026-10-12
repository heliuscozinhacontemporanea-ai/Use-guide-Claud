import { getOfferService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Fecha o horário e devolve as reservas ativas; reembolsar e notificar é da camada application. */
export async function cancelSlotByPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<Booking[]> {
  return getOfferService().cancelSlot(actor, offerId, slotId);
}
