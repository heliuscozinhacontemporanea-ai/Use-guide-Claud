import { promoCodeService } from '../factory';

/** Guarda um uso do cupom para a compra; devolva com `releasePromoUseUseCase` se a compra não acontecer. */
export function reservePromoUseUseCase(promoId: string, buyerUid: string): Promise<string> {
  return promoCodeService.reserveUse(promoId, buyerUid);
}
