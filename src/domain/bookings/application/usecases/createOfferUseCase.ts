import { bookingsApi } from '../../factory';
import type { CreateOfferPayload, PartnerOffer } from '../../types/bookings';

export async function createOfferUseCase(payload: CreateOfferPayload): Promise<PartnerOffer> {
  return bookingsApi.createOffer(payload);
}
