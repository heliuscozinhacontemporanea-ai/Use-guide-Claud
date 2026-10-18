import { getOfferService } from '../factory';
import type { BookableOffer, BookableOfferStatus, BookingActor } from '../types/bookingTypes';

/** Publicar mantém a projeção pública; pausar ou arquivar a remove. */
export async function setBookableOfferStatusUseCase(
  actor: BookingActor,
  offerId: string,
  status: Exclude<BookableOfferStatus, 'draft'>,
  beforePublish?: (offer: BookableOffer) => Promise<void>
): Promise<BookableOffer> {
  return getOfferService().setOfferStatus(actor, offerId, status, beforePublish);
}
