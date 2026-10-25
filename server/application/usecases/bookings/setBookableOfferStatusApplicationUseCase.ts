import {
  type BookableOffer,
  type BookableOfferStatus,
  type BookingActor,
  BookingDomainError,
  setBookableOfferStatusUseCase,
} from '../../../domain/bookings';
import { assertListingCanSellUseCase } from '../../../domain/partners';
import { assertPaymentAccountReadyUseCase } from '../../../domain/payment';
import { isPartnerSuspended } from '../isPartnerSuspended';

/**
 * Publicar exige parceiro ativo, estabelecimento verificado com CNPJ (D12) e a conta Stripe desse CNPJ
 * pronta para receber (D14): sem isso o turista veria uma oferta pública cujo pagamento falha.
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
    const { accountKey } = await assertListingCanSellUseCase(offer.guideItemId);
    await assertPaymentAccountReadyUseCase(accountKey);
  });
}
