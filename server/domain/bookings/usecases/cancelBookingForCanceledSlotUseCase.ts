import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function cancelBookingForCanceledSlotUseCase(
  bookingId: string,
  actorUid: string
): Promise<Booking> {
  return getBookingService().cancelBookingForCanceledSlot(bookingId, actorUid);
}
