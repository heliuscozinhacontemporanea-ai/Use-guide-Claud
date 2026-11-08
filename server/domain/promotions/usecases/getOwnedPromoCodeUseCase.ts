import { promoCodeService } from '../factory';
import type { PromoCode } from '../types/promoCode';

export function getOwnedPromoCodeUseCase(ownerId: string, id: string): Promise<PromoCode> {
  return promoCodeService.getOwned(ownerId, id);
}
