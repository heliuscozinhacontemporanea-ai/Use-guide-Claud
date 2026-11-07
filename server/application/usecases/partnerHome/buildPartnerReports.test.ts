import { describe, expect, it } from 'vitest';
import type { PayoutEntryView } from '../../../domain/payment';
import { buildPartnerReports, reportBuckets } from './buildPartnerReports';

const NOW = '2026-11-08T13:00:00.000Z';

function entry(overrides: Partial<PayoutEntryView>): PayoutEntryView {
  return {
    id: 'e',
    referenceType: 'booking',
    referenceId: 'b',
    title: 'Passeio de buggy',
    accountKey: 'acc1',
    grossMinor: 18000,
    serviceFeeMinor: 0,
    refundedMinor: 0,
    platformFeeMinor: 2700,
    partnerAmountMinor: 15300,
    offsetMinor: 0,
    status: 'pending',
    holdReasons: [],
    serviceEndsAt: NOW,
    releaseAt: NOW,
    releasedAt: null,
    canceledReason: null,
    createdAt: '2026-11-08T12:00:00.000Z',
    ...overrides,
  };
}

describe('buildPartnerReports', () => {
  it('um total por dia no fuso de Fortaleza: 7 dias, 30 dias e 12 meses', () => {
    const week = reportBuckets('7d', NOW);
    expect(week).toHaveLength(7);
    expect(week.at(-1)).toBe('2026-11-08T03:00:00.000Z');
    expect(reportBuckets('30d', NOW)).toHaveLength(30);
    const year = reportBuckets('12m', NOW);
    expect(year[0]).toBe('2025-12-01T03:00:00.000Z');
    expect(year.at(-1)).toBe('2026-11-08T03:00:00.000Z');
    expect(year).toHaveLength(343);
  });

  it('soma por barra e por item, sem taxa de serviço, reembolso nem venda cancelada', () => {
    const report = buildPartnerReports(
      '7d',
      NOW,
      [
        entry({ id: 'a' }),
        entry({ id: 'b', createdAt: '2026-11-07T02:00:00.000Z' }),
        entry({
          id: 'c',
          referenceType: 'ticket_order',
          title: 'Luau na Duna',
          grossMinor: 10300,
          serviceFeeMinor: 300,
        }),
        entry({ id: 'd', refundedMinor: 8000 }),
        entry({ id: 'x', status: 'canceled' }),
        entry({ id: 'velho', createdAt: '2026-10-01T12:00:00.000Z' }),
      ],
      false
    );
    expect(report.soldMinor).toBe(18000 + 18000 + 10000 + 10000);
    expect(report.buckets.at(-1)?.soldMinor).toBe(18000 + 10000 + 10000);
    // 7/11 02:00 UTC ainda é 6/11 em Fortaleza.
    expect(report.buckets.at(-3)?.soldMinor).toBe(18000);
    expect(report.items.map((item) => [item.title, item.soldMinor, item.sales])).toEqual([
      ['Passeio de buggy', 46000, 3],
      ['Luau na Duna', 10000, 1],
    ]);
  });

  it('ingressos (e quantos vieram de divulgador), pessoas e grupos por item', () => {
    const report = buildPartnerReports(
      '7d',
      NOW,
      [
        entry({ id: 'a', referenceId: 'bk1' }),
        entry({ id: 'b', referenceId: 'bk2' }),
        entry({ id: 'c', referenceType: 'ticket_order', referenceId: 'o1', title: 'Luau na Duna' }),
        entry({ id: 'd', referenceType: 'ticket_order', referenceId: 'o2', title: 'Luau na Duna' }),
      ],
      false,
      new Map([
        ['bk1', { people: 3, groups: 0 }],
        ['bk2', { people: 0, groups: 1 }],
        ['o1', { tickets: 2, viaPromoter: true }],
        ['o2', { tickets: 4, viaPromoter: false }],
      ])
    );
    const byTitle = Object.fromEntries(report.items.map((item) => [item.title, item]));
    expect(byTitle['Luau na Duna']).toMatchObject({ tickets: 6, promoterTickets: 2 });
    expect(byTitle['Passeio de buggy']).toMatchObject({ people: 3, groups: 1, tickets: 0 });
  });
});
