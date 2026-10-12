import { bookingsApi } from '../../factory';
import type { CreateSlotsPayload, PartnerSlot } from '../../types/bookings';

export async function createSlotsUseCase(
  offerId: string,
  payload: CreateSlotsPayload
): Promise<PartnerSlot[]> {
  return bookingsApi.createSlots(offerId, payload);
}
