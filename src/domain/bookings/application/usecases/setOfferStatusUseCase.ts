import { bookingsApi } from '../../factory';
import type { OfferStatus, PartnerOffer } from '../../types/bookings';

export async function setOfferStatusUseCase(
  offerId: string,
  status: Exclude<OfferStatus, 'draft'>
): Promise<PartnerOffer> {
  return bookingsApi.setOfferStatus(offerId, status);
}
