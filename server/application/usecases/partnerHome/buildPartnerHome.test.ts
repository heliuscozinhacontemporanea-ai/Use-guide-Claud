import { describe, expect, it } from 'vitest';
import type { PayoutEntryView } from '../../../domain/payment';
import { buildPartnerHome, type PartnerHomeInput } from './buildPartnerHome';

// 10:00 em Fortaleza (UTC−3) de 8 de novembro.
const NOW = '2026-11-08T13:00:00.000Z';

function entry(overrides: Partial<PayoutEntryView>): PayoutEntryView {
  return {
    id: 'e1',
    referenceType: 'booking',
    referenceId: 'b1',
    title: 'Passeio de buggy',
    accountKey: 'acc1',
    grossMinor: 36000,
    serviceFeeMinor: 0,
    refundedMinor: 0,
    platformFeeMinor: 5400,
    partnerAmountMinor: 30600,
    offsetMinor: 0,
    status: 'pending',
    holdReasons: [],
    serviceEndsAt: NOW,
    releaseAt: '2026-11-10T15:00:00.000Z',
    releasedAt: null,
    canceledReason: null,
    createdAt: NOW,
    ...overrides,
  };
}

function input(overrides: Partial<PartnerHomeInput> = {}): PartnerHomeInput {
  return {
    nowIso: NOW,
    establishments: [
      { id: 'buggy', name: 'Buggy do Preá', category: 'tour' },
      { id: 'pousada', name: 'Pousada Vento Leste', category: 'lodging' },
    ],
    documents: [{ accountKey: 'acc1', maskedDocument: '**.***.***/0001-81', itemIds: ['buggy'] }],
    slots: [],
    openAbsences: [],
    sessions: [],
    debts: [],
    accounts: [],
    verifications: [],
    planUntil: [],
    recentEntries: [],
    openEntries: [],
    ...overrides,
  };
}

describe('buildPartnerHome', () => {
  it('põe os prazos em "Resolva agora", do mais próximo para o sem prazo', () => {
    const home = buildPartnerHome(
      input({
        openAbsences: [
          {
            bookingId: 'b9',
            offerId: 'o1',
            guideItemId: 'buggy',
            title: { 'pt-BR': 'Passeio de buggy' },
            startsAt: '2026-11-08T12:00:00.000Z',
            respondBy: '2026-11-08T14:40:00.000Z',
          },
        ],
        debts: [
          {
            id: 'd1',
            accountKey: 'acc1',
            reason: 'cancellation_penalty',
            referenceType: 'booking',
            amountMinor: 5000,
            remainingMinor: 5000,
            status: 'open',
            dueAt: '2026-11-09T13:00:00.000Z',
            overdue: false,
            createdAt: NOW,
          },
        ],
        verifications: [{ itemId: 'pousada', status: 'rejected' }],
        planUntil: [
          { itemId: 'pousada', until: '2026-11-11T03:00:00.000Z' },
          { itemId: 'buggy', until: '2027-03-12T03:00:00.000Z' },
        ],
      })
    );
    expect(home.attention.map((item) => item.kind)).toEqual([
      'provider_absence',
      'debt',
      'plan_expiring',
      'verification_rejected',
    ]);
    expect(home.attention[1]).toMatchObject({
      establishmentIds: ['buggy'],
      title: 'Buggy do Preá',
      amountMinor: 5000,
    });
  });

  it('mostra a conta de recebimento que ainda não vende e a venda retida por reclamação', () => {
    const home = buildPartnerHome(
      input({
        accounts: [{ accountKey: 'acc1', maskedDocument: 'x', itemIds: ['buggy'], account: null }],
        openEntries: [entry({ id: 'held', status: 'on_hold', holdReasons: ['claim'] })],
      })
    );
    expect(home.attention.map((item) => [item.kind, item.establishmentIds])).toEqual([
      ['sale_claim', ['buggy']],
      ['payment_account', ['buggy']],
    ]);
  });

  it('lista só o que começa hoje no fuso de Fortaleza, em ordem de horário', () => {
    const home = buildPartnerHome(
      input({
        slots: [
          {
            slotId: 'ontem',
            offerId: 'o1',
            guideItemId: 'buggy',
            kind: 'tour',
            title: { 'pt-BR': 'Passeio' },
            startsAt: '2026-11-08T02:00:00.000Z',
            status: 'open',
            capacityTotal: 8,
            capacitySold: 6,
            bookingsCount: 3,
            unitsCount: 6,
            checkedInUnits: 0,
          },
          {
            slotId: 'manha',
            offerId: 'o1',
            guideItemId: 'buggy',
            kind: 'tour',
            title: { 'pt-BR': 'Passeio' },
            startsAt: '2026-11-08T12:00:00.000Z',
            status: 'open',
            capacityTotal: 8,
            capacitySold: 6,
            bookingsCount: 3,
            unitsCount: 6,
            checkedInUnits: 4,
          },
        ],
        sessions: [
          {
            id: 's1',
            eventId: 'ev1',
            eventTitle: 'Luau na Duna',
            establishmentId: null,
            startsAt: '2026-11-08T23:00:00.000Z',
            endsAt: null,
            capacity: 300,
            sold: 128,
          },
        ],
      })
    );
    expect(home.today.map((item) => item.id)).toEqual(['manha', 's1']);
    expect(home.today[0]).toMatchObject({ sold: 6, capacity: 8, checkedIn: 4 });
  });

  it('soma as vendas de hoje e o próximo repasse do mesmo dia', () => {
    const home = buildPartnerHome(
      input({
        recentEntries: [
          entry({ id: 'a', grossMinor: 10000 }),
          entry({ id: 'b', grossMinor: 5000, status: 'canceled' }),
          entry({ id: 'c', grossMinor: 7000, createdAt: '2026-11-08T02:59:00.000Z' }),
        ],
        openEntries: [
          entry({ id: 'p1', partnerAmountMinor: 1000, releaseAt: '2026-11-10T15:00:00.000Z' }),
          entry({ id: 'p2', partnerAmountMinor: 2000, releaseAt: '2026-11-10T20:00:00.000Z' }),
          entry({ id: 'p3', partnerAmountMinor: 4000, releaseAt: '2026-11-12T15:00:00.000Z' }),
        ],
      })
    );
    expect(home.numbers.salesTodayMinor).toBe(10000);
    expect(home.numbers.salesTodayCount).toBe(1);
    expect(home.numbers.nextPayout).toEqual({
      releaseAt: '2026-11-10T15:00:00.000Z',
      amountMinor: 3000,
      count: 2,
    });
  });
});
