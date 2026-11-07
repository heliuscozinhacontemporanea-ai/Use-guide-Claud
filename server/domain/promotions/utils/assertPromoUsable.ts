import { PromotionsDomainError } from '../errors/promotionsDomainError';
import type { PromoCode } from '../types/promoCode';

/** Cupom que pode ser usado agora por este comprador; senão, o erro que a tela de compra traduz. */
export function assertPromoUsable(promo: PromoCode, nowIso: string, buyerAlreadyUsed: boolean) {
  if (!promo.isActive) throw new PromotionsDomainError('PROMO_INVALID', 'Cupom inválido.');
  if (promo.startsAt && nowIso < promo.startsAt) {
    throw new PromotionsDomainError('PROMO_NOT_STARTED', 'Este cupom ainda não está valendo.');
  }
  if (promo.endsAt && nowIso >= promo.endsAt) {
    throw new PromotionsDomainError('PROMO_EXPIRED', 'Este cupom já encerrou.');
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    throw new PromotionsDomainError('PROMO_EXHAUSTED', 'Este cupom esgotou.');
  }
  if (buyerAlreadyUsed) {
    throw new PromotionsDomainError('PROMO_ALREADY_USED', 'Você já usou este cupom.');
  }
}
