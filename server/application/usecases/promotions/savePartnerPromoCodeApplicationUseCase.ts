import {
  createPromoCodeUseCase,
  type PromoCodeInput,
  PromotionsDomainError,
  replacePromoCodeUseCase,
} from '../../../domain/promotions';
import { type PartnerPromoCodeView, toPartnerPromoCodeView } from './partnerPromoCodeView';
import { loadOwnerEventTargets } from './promoTargets';

/**
 * Cria o cupom (sem `id`) ou troca tudo antes do primeiro uso. Só vale para eventos do próprio dono
 * e lotes desses eventos: o ID de anúncio de outro dono é recusado como inexistente (A01).
 */
export async function savePartnerPromoCodeApplicationUseCase(
  ownerUid: string,
  input: PromoCodeInput,
  id?: string,
  now: Date = new Date()
): Promise<PartnerPromoCodeView> {
  const events = await loadOwnerEventTargets(ownerUid);
  const byId = new Map(events.map((event) => [event.id, event]));
  for (const target of input.targets) {
    const event = byId.get(target.id);
    const options = new Set(event?.options.map((option) => option.id) ?? []);
    if (!event || (target.optionIds ?? []).some((optionId) => !options.has(optionId))) {
      throw new PromotionsDomainError('PROMO_TARGET_INVALID', 'Anúncio ou lote não encontrado.');
    }
  }
  const promo = id
    ? await replacePromoCodeUseCase(ownerUid, id, input)
    : await createPromoCodeUseCase(ownerUid, input);
  return toPartnerPromoCodeView(promo, events, now.toISOString());
}
