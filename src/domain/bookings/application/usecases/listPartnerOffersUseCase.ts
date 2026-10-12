import { bookingsApi } from '../../factory';
import type { PartnerOffer } from '../../types/bookings';

export async function listPartnerOffersUseCase(): Promise<PartnerOffer[]> {
  return bookingsApi.listPartnerOffers();
}
