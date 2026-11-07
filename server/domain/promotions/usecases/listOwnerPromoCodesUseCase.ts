import { promoCodeService } from '../factory';
import type { PromoCode } from '../types/promoCode';

export function listOwnerPromoCodesUseCase(ownerId: string): Promise<PromoCode[]> {
  return promoCodeService.listByOwner(ownerId);
}
