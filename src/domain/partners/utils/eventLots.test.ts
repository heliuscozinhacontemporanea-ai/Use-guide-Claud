import { describe, expect, it } from 'vitest';
import type { PartnerEventLot } from '../types/partnerHome';
import { lotsFor, lotWindow } from './eventLots';

const lot = (overrides: Partial<PartnerEventLot>): PartnerEventLot => ({
  id: 'l1',
  occurrenceId: 'o1',
  name: '1º lote',
  priceMinor: 8000,
  quantity: 60,
  sold: 10,
  soldMinor: 80000,
  status: 'sold_out',
  salesStartsAt: null,
  salesEndsAt: null,
  days: [{ day: '2026-12-01', count: 10 }],
  ...overrides,
});

describe('eventLots (A5)', () => {
  it('"Todas" junta lotes de mesmo nome e preço; a sessão mostra só os dela', () => {
    const lots = [
      lot({}),
      lot({
        id: 'l2',
        occurrenceId: 'o2',
        sold: 5,
        soldMinor: 40000,
        status: 'on_sale',
        days: [
          { day: '2026-12-01', count: 2 },
          { day: '2026-12-03', count: 3 },
        ],
      }),
      lot({ id: 'l3', name: 'Camarote', priceMinor: 20000 }),
    ];
    const all = lotsFor(lots, null);
    expect(all).toHaveLength(2);
    expect(all[0]).toMatchObject({ sold: 15, quantity: 120, soldMinor: 120000, status: 'on_sale' });
    expect(all[0]?.days).toEqual([
      { day: '2026-12-01', count: 12 },
      { day: '2026-12-03', count: 3 },
    ]);
    expect(lotsFor(lots, 'o2').map((item) => item.id)).toEqual(['l2']);
  });

  it('janela de 14 dias termina hoje e volta até a primeira venda', () => {
    const days = [
      { day: '2026-11-20', count: 4 },
      { day: '2026-12-09', count: 11 },
      { day: '2026-12-12', count: 2 },
    ];
    const now = lotWindow(days, '2026-12-12', 0);
    expect(now.bars).toHaveLength(14);
    expect(now.bars[0]?.day).toBe('2026-11-29');
    expect(now.bars[13]).toEqual({ day: '2026-12-12', count: 2 });
    expect(now).toMatchObject({
      total: 13,
      best: { day: '2026-12-09', count: 11 },
      hasOlder: true,
      hasNewer: false,
    });
    const before = lotWindow(days, '2026-12-12', 1);
    expect(before.bars[0]?.day).toBe('2026-11-15');
    expect(before).toMatchObject({ total: 4, hasOlder: false, hasNewer: true });
    expect(lotWindow([], '2026-12-12', 0)).toMatchObject({ total: 0, best: null, hasOlder: false });
  });
});
