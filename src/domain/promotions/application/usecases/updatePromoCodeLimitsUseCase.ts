import { promoCodesAdapter } from '../../factory';
import type { PromoCodeLimitsEdit } from '../../types/promoCode';

export function updatePromoCodeLimitsUseCase(id: string, edit: PromoCodeLimitsEdit): Promise<void> {
  return promoCodesAdapter.updateLimits(id, edit);
}
