import { describe, expect, it } from 'vitest';
import { type PromoCode, summarizePromoCodes } from './promoCode';

const NOW = new Date('2026-11-08T12:00:00.000Z');

function promo(id: string, overrides: Partial<PromoCode> = {}): PromoCode {
  return {
    id,
    ownerId: 'o',
    code: id.toUpperCase(),
    type: 'percentage',
    percentage: 10,
    valueMinor: null,
    targets: [],
    maxUses: null,
    usedCount: 0,
    firstUsedAt: null,
    onePerAccount: false,
    maxTicketsPerOrder: null,
    startsAt: null,
    endsAt: null,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('summarizePromoCodes', () => {
  it('sem cupom ativo nem uso na semana, o cartão não aparece', () => {
    expect(summarizePromoCodes([promo('a', { isActive: false })], new Map(), NOW)).toBeNull();
  });

  it('conta ativos e agendados, usos da semana, o mais usado e o que acaba primeiro', () => {
    const summary = summarizePromoCodes(
      [
        promo('verao', { endsAt: '2026-11-10T12:00:00.000Z' }),
        promo('vip', { startsAt: '2026-11-20T00:00:00.000Z' }),
        promo('pausado', { isActive: false }),
      ],
      new Map([
        ['verao', 12],
        ['pausado', 3],
      ]),
      NOW
    );
    expect(summary).toEqual({
      active: 2,
      weekUses: 15,
      top: { code: 'VERAO', uses: 12 },
      alert: { code: 'VERAO', kind: 'ending', endsAt: '2026-11-10T12:00:00.000Z' },
    });
  });

  it('avisa quando 80% dos usos já foram gastos', () => {
    const summary = summarizePromoCodes(
      [promo('amigos', { maxUses: 50, usedCount: 45 })],
      new Map(),
      NOW
    );
    expect(summary?.alert).toEqual({ code: 'AMIGOS', kind: 'running_out', used: 45, max: 50 });
    expect(summary?.top).toBeNull();
  });
});
