import { bookingsApi } from '../../factory';
import type { PartnerSlotDetail } from '../../types/bookings';

export function getPartnerSlotDetailUseCase(
  offerId: string,
  slotId: string
): Promise<PartnerSlotDetail> {
  return bookingsApi.getPartnerSlotDetail(offerId, slotId);
}
