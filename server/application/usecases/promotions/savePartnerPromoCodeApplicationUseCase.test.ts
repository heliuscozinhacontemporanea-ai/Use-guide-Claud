import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ targets: vi.fn(), create: vi.fn(), replace: vi.fn() }));
vi.mock('./promoTargets', () => ({ loadOwnerEventTargets: m.targets }));
vi.mock('../../../domain/promotions', async () => {
  const actual = await vi.importActual<object>('../../../domain/promotions/types/promoCode');
  const { PromotionsDomainError } = await import(
    '../../../domain/promotions/errors/promotionsDomainError'
  );
  return {
    ...actual,
    PromotionsDomainError,
    createPromoCodeUseCase: m.create,
    replacePromoCodeUseCase: m.replace,
  };
});

import type { PromoCodeInput } from '../../../domain/promotions';
import { savePartnerPromoCodeApplicationUseCase } from './savePartnerPromoCodeApplicationUseCase';

const INPUT: PromoCodeInput = {
  code: 'VERAO10',
  type: 'percentage',
  percentage: 10,
  valueMinor: null,
  targets: [{ kind: 'event', id: 'ev1', optionIds: ['vip'] }],
  maxUses: null,
  onePerAccount: false,
  maxTicketsPerOrder: null,
  startsAt: null,
  endsAt: null,
};

describe('savePartnerPromoCodeApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.targets.mockResolvedValue([
      {
        id: 'ev1',
        title: 'Luau',
        status: 'published',
        options: [{ id: 'vip', name: 'VIP', sessionStartsAt: '2026-12-20T23:00:00.000Z' }],
      },
    ]);
    m.create.mockImplementation(async (ownerId: string, input: PromoCodeInput) => ({
      ...input,
      id: 'pc1',
      ownerId,
      usedCount: 0,
      firstUsedAt: null,
      isActive: true,
      createdAt: '2026-11-07T00:00:00.000Z',
      updatedAt: '2026-11-07T00:00:00.000Z',
    }));
  });

  it('cria para evento e lote do próprio dono, com os nomes para a tela', async () => {
    const view = await savePartnerPromoCodeApplicationUseCase('owner', INPUT);
    expect(m.create).toHaveBeenCalledWith('owner', INPUT);
    expect(view.targets[0]).toMatchObject({ title: 'Luau', optionNames: ['VIP'] });
    expect(view).not.toHaveProperty('ownerId');
  });

  it('evento ou lote de outro dono é recusado como inexistente (IDOR)', async () => {
    for (const target of [
      { kind: 'event' as const, id: 'ev-de-outro', optionIds: null },
      { kind: 'event' as const, id: 'ev1', optionIds: ['lote-de-outro'] },
    ]) {
      await expect(
        savePartnerPromoCodeApplicationUseCase('owner', { ...INPUT, targets: [target] })
      ).rejects.toMatchObject({ code: 'PROMO_TARGET_INVALID' });
    }
    expect(m.create).not.toHaveBeenCalled();
  });
});
