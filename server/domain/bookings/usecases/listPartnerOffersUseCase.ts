import { getOfferService } from '../factory';
import type { BookableOffer, BookingActor } from '../types/bookingTypes';

export async function listPartnerOffersUseCase(actor: BookingActor): Promise<BookableOffer[]> {
  return getOfferService().listOwnerOffers(actor);
}
