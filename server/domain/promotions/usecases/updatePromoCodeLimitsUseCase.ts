import { promoCodeService } from '../factory';
import type { PromoCode, PromoCodeLimitsEdit } from '../types/promoCode';

export function updatePromoCodeLimitsUseCase(
  ownerId: string,
  id: string,
  edit: PromoCodeLimitsEdit
): Promise<PromoCode> {
  return promoCodeService.updateLimits(ownerId, id, edit);
}
