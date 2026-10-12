import { getOfferService } from '../factory';
import type { OfferInput } from '../services/offerService';
import type { BookableOffer, BookingActor } from '../types/bookingTypes';

export async function updateBookableOfferUseCase(
  actor: BookingActor,
  offerId: string,
  input: Partial<OfferInput>
): Promise<BookableOffer> {
  return getOfferService().updateOffer(actor, offerId, input);
}
