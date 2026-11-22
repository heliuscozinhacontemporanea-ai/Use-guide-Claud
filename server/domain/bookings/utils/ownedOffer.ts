import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import type { BookableOffer, BookingActor } from '../types/bookingTypes';

/** A oferta do parceiro (ou qualquer uma, para o admin); a de outro parceiro responde como inexistente. */
export async function getOwnedOffer(
  port: BookingsPort,
  actor: BookingActor,
  offerId: string
): Promise<BookableOffer> {
  const offer = await port.getOffer(offerId);
  // Não revela que o ID existe.
  if (!offer || (!actor.admin && offer.ownerId !== actor.uid)) {
    throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
  }
  return offer;
}
