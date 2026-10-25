import { describe, expect, it } from 'vitest';
import {
  computeReleaseAt,
  partnerAmountAfterRefunds,
  paymentMethodsForService,
} from './payoutRules';

describe('regras do repasse (D14)', () => {
  it('libera 48 h depois do fim do serviço', () => {
    expect(computeReleaseAt('2026-12-20T03:00:00.000Z')).toBe('2026-12-22T03:00:00.000Z');
  });

  it('Pix só para serviço até 80 dias depois da compra', () => {
    const now = new Date('2026-10-25T12:00:00.000Z');
    expect(paymentMethodsForService('2027-01-13T12:00:00.000Z', now)).toEqual(['card', 'pix']);
    expect(paymentMethodsForService('2027-01-14T12:00:00.000Z', now)).toEqual(['card']);
  });

  it('sem reembolso o proprietário fica com o valor do serviço menos a taxa', () => {
    // 2 ingressos de R$ 50 + R$ 6 de taxa de serviço; taxa da plataforma de 10% = R$ 10.
    expect(
      partnerAmountAfterRefunds({
        grossMinor: 10600,
        serviceFeeMinor: 600,
        platformFeeMinor: 1000,
        refundedServiceMinor: 0,
      })
    ).toEqual({ platformFeeMinor: 1000, partnerAmountMinor: 9000 });
  });

  it('reembolso parcial: a taxa incide sobre o que o proprietário fica, para baixo', () => {
    expect(
      partnerAmountAfterRefunds({
        grossMinor: 10600,
        serviceFeeMinor: 600,
        platformFeeMinor: 1000,
        refundedServiceMinor: 3333,
      })
    ).toEqual({ platformFeeMinor: 666, partnerAmountMinor: 6001 });
    expect(
      partnerAmountAfterRefunds({
        grossMinor: 10600,
        serviceFeeMinor: 600,
        platformFeeMinor: 1000,
        refundedServiceMinor: 10000,
      })
    ).toEqual({ platformFeeMinor: 0, partnerAmountMinor: 0 });
  });
});
