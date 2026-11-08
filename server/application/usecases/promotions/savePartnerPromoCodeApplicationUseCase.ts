import {
  createPromoCodeUseCase,
  type PromoCodeInput,
  PromotionsDomainError,
  replacePromoCodeUseCase,
} from '../../../domain/promotions';
import { type PartnerPromoCodeView, toPartnerPromoCodeView } from './partnerPromoCodeView';
import { loadOwnerPromoTargets } from './promoTargets';

/**
 * Cria o cupom (sem `id`) ou troca tudo antes do primeiro uso. Só vale para eventos e ofertas do
 * próprio dono, com os lotes ou opções deles: anúncio de outro dono é recusado como inexistente (A01).
 */
export async function savePartnerPromoCodeApplicationUseCase(
  ownerUid: string,
  input: PromoCodeInput,
  id?: string,
  now: Date = new Date()
): Promise<PartnerPromoCodeView> {
  const listings = await loadOwnerPromoTargets(ownerUid);
  const byKey = new Map(listings.map((listing) => [`${listing.kind}:${listing.id}`, listing]));
  for (const target of input.targets) {
    const listing = byKey.get(`${target.kind}:${target.id}`);
    const options = new Set(listing?.options.map((option) => option.id) ?? []);
    if (!listing || (target.optionIds ?? []).some((optionId) => !options.has(optionId))) {
      throw new PromotionsDomainError('PROMO_TARGET_INVALID', 'Anúncio ou lote não encontrado.');
    }
  }
  const promo = id
    ? await replacePromoCodeUseCase(ownerUid, id, input)
    : await createPromoCodeUseCase(ownerUid, input);
  return toPartnerPromoCodeView(promo, listings, now.toISOString());
}
