import { listOwnerPromoCodesUseCase } from '../../../domain/promotions';
import { type PartnerPromoCodeView, toPartnerPromoCodeView } from './partnerPromoCodeView';
import { loadOwnerPromoTargets, type PromoListingTarget } from './promoTargets';

/** Área Cupons (B1): os cupons do dono e os eventos e ofertas onde ele pode criar um. */
export async function listPartnerPromoCodesApplicationUseCase(
  ownerUid: string,
  now: Date = new Date()
): Promise<{ promoCodes: PartnerPromoCodeView[]; targets: PromoListingTarget[] }> {
  const [promoCodes, targets] = await Promise.all([
    listOwnerPromoCodesUseCase(ownerUid),
    loadOwnerPromoTargets(ownerUid),
  ]);
  const nowIso = now.toISOString();
  return {
    promoCodes: promoCodes.map((promo) => toPartnerPromoCodeView(promo, targets, nowIso)),
    targets,
  };
}
