import { describe, expect, it, vi } from 'vitest';

vi.mock('../../promotions', async () => {
  const { computePromoDiscount } = await vi.importActual<
    typeof import('../../promotions/utils/computePromoDiscount')
  >('../../promotions/utils/computePromoDiscount');
  return {
    computePromoDiscount,
    getPromoCodeForCheckoutUseCase: vi.fn(),
    reservePromoUseUseCase: vi.fn().mockResolvedValue('red_1'),
    releasePromoUseUseCase: vi.fn().mockResolvedValue(undefined),
  };
});

import { releasePromoUseUseCase, reservePromoUseUseCase } from '../../promotions';
import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';
import { applyBookingPromo, withBookingPromoUse } from './bookingPromo';

const FEES: PlatformFeeConfig = {
  bookingsBps: 1500,
  ticketsBps: 1000,
  ticketsAbsorbedBps: 1250,
  ticketServiceFeeMinor: 300,
};
const PRICED = {
  lines: [
    { priceOptionId: 'adulto', quantity: 2, unitAmountMinor: 10000 },
    { priceOptionId: 'crianca', quantity: 1, unitAmountMinor: 5000 },
  ],
  participantsCount: 3,
  subtotalMinor: 25000,
  platformFeeMinor: 3750,
  totalMinor: 25000,
};

function promo(overrides: object) {
  return {
    promo: {
      type: 'percentage',
      percentage: 10,
      valueMinor: null,
      maxTicketsPerOrder: null,
      ...overrides,
    },
    optionIds: null,
  } as never;
}

describe('applyBookingPromo', () => {
  it('porcentagem por pessoa; a taxa da plataforma sai do valor com desconto', () => {
    const priced = applyBookingPromo(PRICED, promo({}), FEES);
    expect(priced).toMatchObject({
      discountMinor: 2500,
      totalMinor: 22500,
      platformFeeMinor: 3375,
    });
  });

  it('aluguel: valor fixo uma vez sobre o total do período, nunca acima de 90%', () => {
    const rental = {
      ...PRICED,
      lines: [{ priceOptionId: 'diaria', quantity: 3, unitAmountMinor: 20000 }],
      subtotalMinor: 60000,
      totalMinor: 60000,
    };
    expect(
      applyBookingPromo(rental, promo({ type: 'fixed', percentage: null, valueMinor: 5000 }), FEES)
    ).toMatchObject({ discountMinor: 5000, totalMinor: 55000 });
    expect(
      applyBookingPromo(
        rental,
        promo({ type: 'fixed', percentage: null, valueMinor: 999_999 }),
        FEES
      )
    ).toMatchObject({ discountMinor: 54000, totalMinor: 6000 });
  });
});

describe('withBookingPromoUse', () => {
  it('guarda o uso antes de criar e devolve se a reserva falhar', async () => {
    await expect(
      withBookingPromoUse({ promoId: 'pc1', buyerUid: 'b' }, async (use) => use)
    ).resolves.toEqual({ promoCodeId: 'pc1', promoRedemptionId: 'red_1' });
    expect(reservePromoUseUseCase).toHaveBeenCalledWith('pc1', 'b');
    await expect(
      withBookingPromoUse({ promoId: 'pc1', buyerUid: 'b' }, async () => {
        throw new Error('sem vaga');
      })
    ).rejects.toThrow('sem vaga');
    expect(releasePromoUseUseCase).toHaveBeenCalledWith('red_1');
  });
});
