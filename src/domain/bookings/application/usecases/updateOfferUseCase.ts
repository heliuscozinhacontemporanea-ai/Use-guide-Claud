import { bookingsApi } from '../../factory';
import type { OfferFields, PartnerOffer } from '../../types/bookings';

export async function updateOfferUseCase(
  offerId: string,
  payload: Partial<OfferFields>
): Promise<PartnerOffer> {
  return bookingsApi.updateOffer(offerId, payload);
}
