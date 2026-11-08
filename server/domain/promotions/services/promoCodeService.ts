import { PromotionsDomainError } from '../errors/promotionsDomainError';
import type { PromoCodePort } from '../ports/promoCodePort';
import {
  normalizePromoCode,
  PROMO_CODE_PATTERN,
  PROMO_MAX_PERCENT,
  type PromoCode,
  type PromoCodeInput,
  type PromoCodeLimitsEdit,
  PROMO_SUMMARY_DAYS,
  type PromoCodesSummary,
  type PromoTarget,
  promoTargetKey,
  summarizePromoCodes,
} from '../types/promoCode';
import { assertPromoUsable } from '../utils/assertPromoUsable';

function invalid(message: string): never {
  throw new PromotionsDomainError('INVALID_ARGUMENT', message);
}

/** Regras do cupom que não dependem de onde ele vale. */
export function validatePromoCodeInput(input: PromoCodeInput): PromoCodeInput {
  const code = normalizePromoCode(input.code);
  if (!PROMO_CODE_PATTERN.test(code)) invalid('Código: de 3 a 20 letras ou números.');
  if (input.type === 'percentage') {
    const percent = input.percentage ?? 0;
    if (!Number.isInteger(percent) || percent < 1 || percent > PROMO_MAX_PERCENT) {
      invalid(`Desconto de 1% a ${PROMO_MAX_PERCENT}%.`);
    }
  } else if (!Number.isInteger(input.valueMinor) || (input.valueMinor ?? 0) < 1) {
    invalid('Informe o valor do desconto.');
  }
  const keys = input.targets.map(promoTargetKey);
  if (keys.length === 0) invalid('Escolha pelo menos um anúncio.');
  if (new Set(keys).size !== keys.length) invalid('Anúncio repetido.');
  if (input.maxUses !== null && (!Number.isInteger(input.maxUses) || input.maxUses < 1)) {
    invalid('Limite de usos inválido.');
  }
  if (
    input.maxTicketsPerOrder !== null &&
    (!Number.isInteger(input.maxTicketsPerOrder) || input.maxTicketsPerOrder < 1)
  ) {
    invalid('Máximo de ingressos com desconto inválido.');
  }
  if (input.startsAt && input.endsAt && input.startsAt >= input.endsAt) {
    invalid('O fim precisa ser depois do início.');
  }
  return {
    ...input,
    code,
    percentage: input.type === 'percentage' ? input.percentage : null,
    valueMinor: input.type === 'fixed' ? input.valueMinor : null,
    maxTicketsPerOrder: input.type === 'percentage' ? input.maxTicketsPerOrder : null,
  };
}

export class PromoCodeService {
  constructor(private readonly port: PromoCodePort) {}

  listByOwner(ownerId: string): Promise<PromoCode[]> {
    return this.port.listByOwner(ownerId);
  }

  /** Cupom de outro dono responde igual a inexistente (A01). */
  async getOwned(ownerId: string, id: string): Promise<PromoCode> {
    const promo = await this.port.getById(id);
    if (!promo || promo.ownerId !== ownerId) {
      throw new PromotionsDomainError('NOT_FOUND', 'Cupom não encontrado.');
    }
    return promo;
  }

  create(ownerId: string, input: PromoCodeInput, now = new Date()): Promise<PromoCode> {
    return this.port.create(ownerId, validatePromoCodeInput(input), now.toISOString());
  }

  async replace(
    ownerId: string,
    id: string,
    input: PromoCodeInput,
    now = new Date()
  ): Promise<PromoCode> {
    await this.getOwned(ownerId, id);
    return this.port.replace(id, validatePromoCodeInput(input), now.toISOString());
  }

  async updateLimits(
    ownerId: string,
    id: string,
    edit: PromoCodeLimitsEdit,
    now = new Date()
  ): Promise<PromoCode> {
    await this.getOwned(ownerId, id);
    if (edit.maxUses !== undefined && edit.maxUses !== null && edit.maxUses < 1) {
      invalid('Limite de usos inválido.');
    }
    return this.port.updateLimits(id, edit, now.toISOString());
  }

  async delete(ownerId: string, id: string): Promise<void> {
    await this.getOwned(ownerId, id);
    await this.port.delete(id);
  }

  /** Cupom que vale para o anúncio agora, com os lotes que levam desconto nele. */
  async getForCheckout(
    params: { code: string; target: Pick<PromoTarget, 'kind' | 'id'>; buyerUid: string },
    now = new Date()
  ): Promise<{ promo: PromoCode; optionIds: string[] | null }> {
    const promo = await this.port.findForTarget(params.code, promoTargetKey(params.target));
    if (!promo) throw new PromotionsDomainError('PROMO_INVALID', 'Cupom inválido.');
    const used = promo.onePerAccount && (await this.port.hasBuyerUse(promo.id, params.buyerUid));
    assertPromoUsable(promo, now.toISOString(), used);
    const target = promo.targets.find(
      (item) => item.kind === params.target.kind && item.id === params.target.id
    );
    return { promo, optionIds: target?.optionIds ?? null };
  }

  /** Cartão "Cupons" do Início: ativos, usos na semana, o mais usado e o que acaba primeiro. */
  async summarize(ownerId: string, now = new Date()): Promise<PromoCodesSummary | null> {
    const since = new Date(now.getTime() - PROMO_SUMMARY_DAYS * 24 * 60 * 60 * 1000);
    const [promos, uses] = await Promise.all([
      this.port.listByOwner(ownerId),
      this.port.countOwnerUsesSince(ownerId, since.toISOString()),
    ]);
    return summarizePromoCodes(promos, uses, now);
  }

  reserveUse(promoId: string, buyerUid: string, now = new Date()): Promise<string> {
    return this.port.reserveUse(promoId, buyerUid, now.toISOString());
  }

  releaseUse(redemptionId: string, now = new Date()): Promise<void> {
    return this.port.releaseUse(redemptionId, now.toISOString());
  }
}
