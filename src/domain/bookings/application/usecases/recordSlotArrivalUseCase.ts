import { bookingsApi } from '../../factory';
import type { ArrivalLocation } from '../../types/bookings';

export async function recordSlotArrivalUseCase(
  offerId: string,
  slotId: string,
  location?: ArrivalLocation
): Promise<{ arrivedAt: string | null; waiting: number }> {
  return bookingsApi.recordSlotArrival(offerId, slotId, location);
}
