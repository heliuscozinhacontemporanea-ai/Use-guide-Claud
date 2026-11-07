import { promoCodeService } from '../factory';
import type { PromoCode, PromoCodeInput } from '../types/promoCode';

/** Só antes do primeiro uso; quem chama já conferiu os anúncios e os lotes. */
export function replacePromoCodeUseCase(
  ownerId: string,
  id: string,
  input: PromoCodeInput
): Promise<PromoCode> {
  return promoCodeService.replace(ownerId, id, input);
}
