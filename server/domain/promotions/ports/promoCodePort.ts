import type { PromoCode, PromoCodeInput, PromoCodeLimitsEdit } from '../types/promoCode';

export interface PromoCodePort {
  listByOwner(ownerId: string): Promise<PromoCode[]>;
  getById(id: string): Promise<PromoCode | null>;
  /** Cupom do código que vale para o anúncio (`kind:id`), ou null. */
  findForTarget(code: string, targetKey: string): Promise<PromoCode | null>;
  /** Se o comprador já tem um uso guardado deste cupom. */
  hasBuyerUse(promoId: string, buyerUid: string): Promise<boolean>;
  /** Lança `PROMO_CODE_TAKEN` quando o dono já tem o código. */
  create(ownerId: string, input: PromoCodeInput, nowIso: string): Promise<PromoCode>;
  /** Troca tudo; lança `PROMO_LOCKED` se o cupom foi usado e `PROMO_CODE_TAKEN` no código repetido. */
  replace(id: string, input: PromoCodeInput, nowIso: string): Promise<PromoCode>;
  /** Lança `INVALID_ARGUMENT` quando o limite fica abaixo dos usos atuais. */
  updateLimits(id: string, edit: PromoCodeLimitsEdit, nowIso: string): Promise<PromoCode>;
  /** Lança `PROMO_IN_USE` quando o cupom já foi usado alguma vez. */
  delete(id: string): Promise<void>;
  /** Confere vigência e limites na mesma transação e guarda um uso; devolve o ID do uso. */
  reserveUse(promoId: string, buyerUid: string, nowIso: string): Promise<string>;
  /** Devolve o uso de um pedido que não foi pago; repetir não faz nada. */
  releaseUse(redemptionId: string, nowIso: string): Promise<void>;
  /** Usos guardados (não devolvidos) dos cupons do dono desde `sinceIso`, por cupom. */
  countOwnerUsesSince(ownerId: string, sinceIso: string): Promise<Map<string, number>>;
}
