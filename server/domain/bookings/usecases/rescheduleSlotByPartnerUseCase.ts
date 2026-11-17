import { getSlotService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Muda o horário e devolve as reservas ativas movidas; repasse e avisos são da camada application. */
export async function rescheduleSlotByPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string,
  change: { startsAt: string; endsAt?: string; reason: string }
): Promise<Booking[]> {
  return getSlotService().rescheduleSlot(actor, offerId, slotId, change);
}
