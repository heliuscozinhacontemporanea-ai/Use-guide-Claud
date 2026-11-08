import { promoCodeService } from '../factory';
import type { PromoCode, PromoCodeInput } from '../types/promoCode';

/** Quem chama já conferiu que os anúncios e os lotes são do dono. */
export function createPromoCodeUseCase(ownerId: string, input: PromoCodeInput): Promise<PromoCode> {
  return promoCodeService.create(ownerId, input);
}
