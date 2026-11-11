import { describe, expect, it } from 'vitest';
import type { PartnerEventLot } from '../types/partnerHome';
import { lotPeriod, lotsFor, lotWindow } from './eventLots';

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

  it('janela de 14 dias termina hoje no lote à venda e volta até a abertura das vendas', () => {
    const open = lot({
      status: 'on_sale',
      salesStartsAt: '2026-11-18T12:00:00.000Z',
      days: [
        { day: '2026-11-20', count: 4 },
        { day: '2026-12-09', count: 11 },
        { day: '2026-12-12', count: 2 },
      ],
    });
    const period = lotPeriod(open, '2026-12-12', 'America/Fortaleza');
    expect(period).toEqual({ from: '2026-11-18', to: '2026-12-12' });
    const now = lotWindow(open.days, period, 0);
    expect(now.bars).toHaveLength(14);
    expect(now.bars[0]?.day).toBe('2026-11-29');
    expect(now.bars[13]).toEqual({ day: '2026-12-12', count: 2, inPeriod: true });
    expect(now).toMatchObject({
      total: 13,
      best: { day: '2026-12-09', count: 11 },
      hasOlder: true,
      hasNewer: false,
    });
    const before = lotWindow(open.days, period, 1);
    expect(before.bars[0]).toMatchObject({ day: '2026-11-15', inPeriod: false });
    expect(before.bars[3]).toMatchObject({ day: '2026-11-18', inPeriod: true });
    expect(before).toMatchObject({ total: 4, hasOlder: false, hasNewer: true });
  });

  it('lote encerrado ou esgotado mostra até a última venda; sem venda, até o fim das vendas', () => {
    const soldOut = lot({
      status: 'sold_out',
      days: [
        { day: '2026-11-20', count: 4 },
        { day: '2026-11-25', count: 6 },
      ],
    });
    const period = lotPeriod(soldOut, '2026-12-12', 'America/Fortaleza');
    expect(period).toEqual({ from: '2026-11-20', to: '2026-11-25' });
    const window = lotWindow(soldOut.days, period, 0);
    expect(window.bars[13]).toEqual({ day: '2026-11-25', count: 6, inPeriod: true });
    expect(window.bars[7]).toMatchObject({ day: '2026-11-19', inPeriod: false });
    expect(window).toMatchObject({ total: 10, hasOlder: false, hasNewer: false });
    const empty = lot({ status: 'ended', salesEndsAt: '2026-12-01T12:00:00.000Z', days: [] });
    expect(lotPeriod(empty, '2026-12-12', 'America/Fortaleza')).toEqual({
      from: null,
      to: '2026-12-01',
    });
  });
});
