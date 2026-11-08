import {
  computePromoDiscount,
  getPromoCodeForCheckoutUseCase,
  releasePromoUseUseCase,
  reservePromoUseUseCase,
} from '../../promotions';
import {
  bookingPlatformFeeMinor,
  type PlatformFeeConfig,
} from '../../../shared/kernel/platformFees';
import type { PricedBooking } from './bookingPricing';

type CheckoutPromo = Awaited<ReturnType<typeof getPromoCodeForCheckoutUseCase>>;

/** Cupom informado na reserva que vale para a oferta; lança o motivo quando não vale. */
export function loadBookingPromo(code: string | undefined, offerId: string, buyerUid: string) {
  if (!code) return Promise.resolve(null);
  return getPromoCodeForCheckoutUseCase({ code, target: { kind: 'offer', id: offerId }, buyerUid });
}

/**
 * Preço com o cupom: desconto por pessoa ou unidade nas opções que valem (ou uma vez por reserva, no
 * valor fixo). No aluguel, vale sobre o total do período; caução não entra (aprovado em 2026-11-08).
 */
export function applyBookingPromo(
  priced: PricedBooking,
  { promo, optionIds }: CheckoutPromo,
  feeConfig: PlatformFeeConfig
): PricedBooking & { discountMinor: number } {
  const discounts = computePromoDiscount(
    promo,
    optionIds,
    priced.lines.map((line) => ({
      optionId: line.priceOptionId,
      unitPriceMinor: line.unitAmountMinor,
      quantity: line.quantity,
    }))
  );
  const discountMinor = Math.min(
    priced.subtotalMinor,
    discounts.reduce((sum, value) => sum + value, 0)
  );
  const totalMinor = priced.subtotalMinor - discountMinor;
  return {
    ...priced,
    discountMinor,
    platformFeeMinor: bookingPlatformFeeMinor(totalMinor, feeConfig),
    totalMinor,
  };
}

/** Guarda o uso do cupom antes de criar a reserva e o devolve se ela não for criada. */
export async function withBookingPromoUse<T>(
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

/** Reserva que expira ou é desfeita sem pagamento devolve o uso do cupom. */
export async function releaseBookingPromo(booking: { promoRedemptionId?: string }) {
  if (booking.promoRedemptionId) await releasePromoUseUseCase(booking.promoRedemptionId);
}
