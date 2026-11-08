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
    cards: ['today'],
    unansweredReviews: { buggy: 2 },
    establishments: [
      {
        id: 'buggy',
        name: 'Buggy do Preá',
        category: 'tour',
        location: 'Preá',
        rating: 4.8,
        reviewCount: 96,
      },
      {
        id: 'pousada',
        name: 'Pousada Vento Leste',
        category: 'lodging',
        location: 'Preá',
        rating: 0,
        reviewCount: 0,
      },
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
    expect(home.establishments[0]).toMatchObject({ id: 'buggy', unansweredReviews: 2 });
    expect(home.establishments[1]).toMatchObject({ id: 'pousada', unansweredReviews: 0 });
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
            serviceEndsAt: '2026-11-08T04:00:00.000Z',
            meetingPoint: null,
            waitingBookings: 0,
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
            serviceEndsAt: '2026-11-08T14:00:00.000Z',
            meetingPoint: 'Praça Principal',
            waitingBookings: 1,
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
            courtesies: 0,
          },
        ],
      })
    );
    expect(home.today.map((item) => item.id)).toEqual(['manha', 's1']);
    expect(home.today[0]).toMatchObject({
      sold: 6,
      capacity: 8,
      checkedIn: 4,
      bookings: 3,
      waitingBookings: 1,
      meetingPoint: 'Praça Principal',
      serviceEndsAt: '2026-11-08T14:00:00.000Z',
    });
    // "Agora" também leva o horário de ontem à noite: o código vale até 12 h depois do fim.
    expect(home.agora.map((item) => item.id)).toEqual(['ontem', 'manha', 's1']);
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
      accounts: 1,
    });
  });

  it('monta os dados dos cartões: próximas sessões, semana e vendas do mês', () => {
    const slot = (id: string, startsAt: string, unitsCount: number) => ({
      slotId: id,
      offerId: 'o1',
      guideItemId: 'buggy',
      kind: 'tour' as const,
      title: { 'pt-BR': 'Passeio' },
      startsAt,
      status: 'open' as const,
      capacityTotal: 8,
      capacitySold: unitsCount,
      bookingsCount: 0,
      unitsCount,
      checkedInUnits: 0,
      serviceEndsAt: startsAt,
      meetingPoint: null,
      waitingBookings: 0,
    });
    const home = buildPartnerHome(
      input({
        slots: [
          slot('a', '2026-11-08T12:00:00.000Z', 6),
          slot('b', '2026-11-08T17:00:00.000Z', 2),
          slot('c', '2026-11-10T12:00:00.000Z', 4),
          slot('fora', '2026-11-15T12:00:00.000Z', 8),
        ],
        sessions: [
          {
            id: 'passou',
            eventId: 'ev',
            eventTitle: 'Luau',
            establishmentId: 'buggy',
            startsAt: '2026-11-08T03:00:00.000Z',
            endsAt: null,
            capacity: 300,
            sold: 10,
            courtesies: 0,
          },
          {
            id: 'proxima',
            eventId: 'ev',
            eventTitle: 'Luau',
            establishmentId: 'buggy',
            startsAt: '2026-12-20T23:00:00.000Z',
            endsAt: null,
            capacity: 300,
            sold: 128,
            courtesies: 0,
          },
        ],
        recentEntries: [
          entry({ id: 'nov', grossMinor: 1000, createdAt: '2026-11-01T03:00:00.000Z' }),
          entry({ id: 'out', grossMinor: 500, createdAt: '2026-11-01T02:59:00.000Z' }),
          entry({ id: 'set', grossMinor: 900, createdAt: '2026-09-30T12:00:00.000Z' }),
        ],
      })
    );
    expect(home.cards).toEqual(['today']);
    expect(home.upcomingSessions.map((session) => session.id)).toEqual(['proxima']);
    expect(home.week).toEqual([
      { date: '2026-11-08T03:00:00.000Z', establishmentIds: ['buggy'], sold: 8, capacity: 16 },
      { date: '2026-11-10T03:00:00.000Z', establishmentIds: ['buggy'], sold: 4, capacity: 8 },
    ]);
    expect(home.numbers.month).toEqual({ currentMinor: 1000, previousMinor: 500 });
  });
});
