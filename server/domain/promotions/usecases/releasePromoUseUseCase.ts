import { promoCodeService } from '../factory';

export function releasePromoUseUseCase(redemptionId: string): Promise<void> {
  return promoCodeService.releaseUse(redemptionId);
}
