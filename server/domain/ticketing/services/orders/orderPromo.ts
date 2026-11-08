import {
  getPromoCodeForCheckoutUseCase,
  releasePromoUseUseCase,
  reservePromoUseUseCase,
} from '../../../promotions';

/** Cupom informado na compra que vale para o evento; lança o motivo quando não vale (B1). */
export function loadCheckoutPromo(code: string | undefined, eventId: string, buyerUid: string) {
  if (!code) return Promise.resolve(null);
  return getPromoCodeForCheckoutUseCase({ code, target: { kind: 'event', id: eventId }, buyerUid });
}

/**
 * Guarda o uso do cupom antes de criar o pedido e o devolve se o pedido não for criado. Sem desconto,
 * ou na repetição de um pedido já criado, nenhum uso é guardado.
 */
export async function withPromoUse<T>(
  params: { promoId: string | null; buyerUid: string },
  create: (use: { promoCodeId?: string; promoRedemptionId?: string }) => Promise<T>
): Promise<T> {
  if (!params.promoId) return create({});
  const promoRedemptionId = await reservePromoUseUseCase(params.promoId, params.buyerUid);
  try {
    return await create({ promoCodeId: params.promoId, promoRedemptionId });
  } catch (error) {
    await releasePromoUseUseCase(promoRedemptionId).catch(() => undefined);
    throw error;
  }
}

/** Pedido que expira sem pagar devolve o uso do cupom (o limite conta compras). */
export async function releaseOrderPromo(order: { promoRedemptionId?: string } | null) {
  if (order?.promoRedemptionId) await releasePromoUseUseCase(order.promoRedemptionId);
}
