import { promoCodesAdapter } from '../../factory';
import type { PromoCodesData } from '../../types/promoCode';

export function listPromoCodesUseCase(): Promise<PromoCodesData> {
  return promoCodesAdapter.list();
}
