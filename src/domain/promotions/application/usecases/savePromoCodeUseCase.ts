import { promoCodesAdapter } from '../../factory';
import type { PartnerPromoCode, PromoCodeInput } from '../../types/promoCode';

/** Cria (sem `id`) ou troca tudo num cupom ainda não usado. */
export function savePromoCodeUseCase(
  input: PromoCodeInput,
  id?: string
): Promise<PartnerPromoCode> {
  return id ? promoCodesAdapter.replace(id, input) : promoCodesAdapter.create(input);
}
