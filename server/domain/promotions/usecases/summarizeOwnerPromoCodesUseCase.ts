import { promoCodeService } from '../factory';
import type { PromoCodesSummary } from '../types/promoCode';

export function summarizeOwnerPromoCodesUseCase(
  ownerId: string
): Promise<PromoCodesSummary | null> {
  return promoCodeService.summarize(ownerId);
}
