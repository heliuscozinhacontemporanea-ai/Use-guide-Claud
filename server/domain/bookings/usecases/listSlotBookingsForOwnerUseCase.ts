import { getOwnerAgendaService } from '../factory';
import type { AvailabilitySlot, BookableOffer, Booking, BookingActor } from '../types/bookingTypes';

export function listSlotBookingsForOwnerUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<{ offer: BookableOffer; slot: AvailabilitySlot; bookings: Booking[] }> {
  return getOwnerAgendaService().listSlotBookings(actor, offerId, slotId);
}
