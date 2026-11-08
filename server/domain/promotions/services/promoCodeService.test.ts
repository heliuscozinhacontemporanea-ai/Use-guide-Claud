import { describe, expect, it, vi } from 'vitest';
import type { PromoCodePort } from '../ports/promoCodePort';
import type { PromoCode, PromoCodeInput } from '../types/promoCode';
import { PromoCodeService, validatePromoCodeInput } from './promoCodeService';

const INPUT: PromoCodeInput = {
  code: ' verao10 ',
  type: 'percentage',
  percentage: 10,
  valueMinor: 500,
  targets: [{ kind: 'event', id: 'ev1', optionIds: null }],
  maxUses: null,
  onePerAccount: false,
  maxTicketsPerOrder: 2,
  startsAt: null,
  endsAt: null,
};

function promo(overrides: Partial<PromoCode> = {}): PromoCode {
  return {
    id: 'pc1',
    ownerId: 'owner',
    code: 'VERAO10',
    type: 'percentage',
    percentage: 10,
    valueMinor: null,
    targets: [{ kind: 'event', id: 'ev1', optionIds: ['vip'] }],
    maxUses: 100,
    usedCount: 0,
    firstUsedAt: null,
    onePerAccount: true,
    maxTicketsPerOrder: null,
    startsAt: null,
    endsAt: null,
    isActive: true,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

function port(found: PromoCode | null, buyerUsed = false) {
  return {
    getById: vi.fn().mockResolvedValue(found),
    findForTarget: vi.fn().mockResolvedValue(found),
    hasBuyerUse: vi.fn().mockResolvedValue(buyerUsed),
    create: vi.fn(),
    replace: vi.fn(),
    updateLimits: vi.fn(),
    delete: vi.fn(),
  } as unknown as PromoCodePort & Record<string, ReturnType<typeof vi.fn>>;
}

describe('validatePromoCodeInput', () => {
  it('normaliza o código e limpa o que não vale para o tipo', () => {
    expect(validatePromoCodeInput(INPUT)).toMatchObject({ code: 'VERAO10', valueMinor: null });
    expect(validatePromoCodeInput({ ...INPUT, type: 'fixed', valueMinor: 1000 })).toMatchObject({
      percentage: null,
      maxTicketsPerOrder: null,
    });
  });

  it('recusa desconto acima de 90%, código curto, sem anúncio e datas trocadas', () => {
    for (const bad of [
      { percentage: 91 },
      { code: 'ab' },
      { code: 'VER ÃO' },
      { targets: [] },
      { targets: [INPUT.targets[0]!, INPUT.targets[0]!] },
      { startsAt: '2026-12-02T00:00:00.000Z', endsAt: '2026-12-01T00:00:00.000Z' },
      { maxUses: 0 },
    ]) {
      expect(() => validatePromoCodeInput({ ...INPUT, ...bad })).toThrow();
    }
  });
});

describe('PromoCodeService', () => {
  it('cupom de outro dono responde como inexistente (IDOR)', async () => {
    const service = new PromoCodeService(port(promo({ ownerId: 'outro' })));
    await expect(service.getOwned('owner', 'pc1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.delete('owner', 'pc1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.updateLimits('owner', 'pc1', { isActive: false })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('na compra: devolve os lotes do evento e recusa cupom esgotado, encerrado, futuro ou já usado', async () => {
    const now = new Date('2026-11-07T12:00:00.000Z');
    const target = { kind: 'event' as const, id: 'ev1' };
    const ok = await new PromoCodeService(port(promo())).getForCheckout(
      { code: 'verao10', target, buyerUid: 'b' },
      now
    );
    expect(ok.optionIds).toEqual(['vip']);
    const cases: Array<[PromoCode | null, boolean, string]> = [
      [null, false, 'PROMO_INVALID'],
      [promo({ isActive: false }), false, 'PROMO_INVALID'],
      [promo({ usedCount: 100 }), false, 'PROMO_EXHAUSTED'],
      [promo({ endsAt: '2026-11-07T11:00:00.000Z' }), false, 'PROMO_EXPIRED'],
      [promo({ startsAt: '2026-11-08T00:00:00.000Z' }), false, 'PROMO_NOT_STARTED'],
      [promo(), true, 'PROMO_ALREADY_USED'],
    ];
    for (const [found, used, code] of cases) {
      await expect(
        new PromoCodeService(port(found, used)).getForCheckout(
          { code: 'VERAO10', target, buyerUid: 'b' },
          now
        )
      ).rejects.toMatchObject({ code });
    }
  });
});
