import { listOwnerPromoCodesUseCase } from '../../../domain/promotions';
import { type PartnerPromoCodeView, toPartnerPromoCodeView } from './partnerPromoCodeView';
import { loadOwnerEventTargets, type PromoEventTarget } from './promoTargets';

/** Área Cupons (B1): os cupons do dono e os anúncios onde ele pode criar um. */
export async function listPartnerPromoCodesApplicationUseCase(
  ownerUid: string,
  now: Date = new Date()
): Promise<{ promoCodes: PartnerPromoCodeView[]; events: PromoEventTarget[] }> {
  const [promoCodes, events] = await Promise.all([
    listOwnerPromoCodesUseCase(ownerUid),
    loadOwnerEventTargets(ownerUid),
  ]);
  const nowIso = now.toISOString();
  return {
    promoCodes: promoCodes.map((promo) => toPartnerPromoCodeView(promo, events, nowIso)),
    events,
  };
}
