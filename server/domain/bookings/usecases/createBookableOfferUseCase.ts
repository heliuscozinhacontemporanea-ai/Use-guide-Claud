import { getOfferService } from '../factory';
import type { OfferInput } from '../services/offerService';
import type { BookableOffer, BookableOfferKind, BookingActor } from '../types/bookingTypes';

export async function createBookableOfferUseCase(
  actor: BookingActor,
  input: OfferInput & { guideItemId: string; kind: BookableOfferKind }
): Promise<BookableOffer> {
  return getOfferService().createOffer(actor, input);
}
