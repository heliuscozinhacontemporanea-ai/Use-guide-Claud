import { promoCodeService } from '../factory';
import type { PromoCode, PromoTarget } from '../types/promoCode';

/** Lança `PromotionsDomainError` com o motivo (inválido, ainda não vale, encerrado, esgotado, já usado). */
export function getPromoCodeForCheckoutUseCase(params: {
  code: string;
  target: Pick<PromoTarget, 'kind' | 'id'>;
  buyerUid: string;
}): Promise<{ promo: PromoCode; optionIds: string[] | null }> {
  return promoCodeService.getForCheckout(params);
}
