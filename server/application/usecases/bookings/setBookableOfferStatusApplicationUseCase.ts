import {
  type BookableOffer,
  type BookableOfferStatus,
  type BookingActor,
  BookingDomainError,
  setBookableOfferStatusUseCase,
} from '../../../domain/bookings';
import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
import { isPartnerSuspended } from '../isPartnerSuspended';

/**
 * Publicar exige parceiro ativo e conta Stripe pronta para vender (decisão D8): sem isso o turista
 * veria uma oferta pública cujo pagamento falha.
 */
export async function setBookableOfferStatusApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  status: Exclude<BookableOfferStatus, 'draft'>
): Promise<BookableOffer> {
  return setBookableOfferStatusUseCase(actor, offerId, status, async (offer) => {
    if (await isPartnerSuspended(offer.partnerId)) {
      throw new BookingDomainError(
        'PARTNER_SUSPENDED',
        'Conta de parceiro suspensa: não é possível publicar ofertas.'
      );
    }
    await assertPartnerReadyForPaidEventUseCase(offer.partnerId);
  });
}
