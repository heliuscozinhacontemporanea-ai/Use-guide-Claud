import { describe, expect, it } from 'vitest';
import type { PayoutEntryView } from '../../../domain/payment';
import { buildPartnerEarnings, type EarningsInput } from './buildPartnerEarnings';

function entry(overrides: Partial<PayoutEntryView>): PayoutEntryView {
  return {
    id: 'e1',
    referenceType: 'booking',
    referenceId: 'b1',
    title: 'Passeio de buggy',
    accountKey: 'acc1',
    grossMinor: 30000,
    serviceFeeMinor: 0,
    refundedMinor: 0,
    platformFeeMinor: 4500,
    partnerAmountMinor: 25500,
    offsetMinor: 0,
    status: 'pending',
    holdReasons: [],
    serviceEndsAt: '2026-11-03T15:00:00.000Z',
    releaseAt: '2026-11-06T13:00:00.000Z',
    releasedAt: null,
    canceledReason: null,
    createdAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

function input(overrides: Partial<EarningsInput> = {}): EarningsInput {
  return {
    timeZone: 'America/Fortaleza',
    nowIso: '2026-11-08T13:00:00.000Z',
    monthStartIso: '2026-11-01T03:00:00.000Z',
    open: [],
    released: [],
    accounts: [
      { accountKey: 'acc1', maskedDocument: '••••/0001-81', itemIds: ['buggy'], ready: true },
      { accountKey: 'acc2', maskedDocument: '••••/0001-22', itemIds: ['pousada'], ready: false },
    ],
    names: new Map([
      ['buggy', 'Buggy do Preá'],
      ['pousada', 'Pousada Vento Leste'],
    ]),
    ...overrides,
  };
}

describe('buildPartnerEarnings', () => {
  it('agrupa por CNPJ e dia, separa a retida e desconta a dívida do que cai', () => {
    const view = buildPartnerEarnings(
      input({
        open: [
          entry({ id: 'a', releaseAt: '2026-11-06T13:00:00.000Z' }),
          entry({ id: 'b', releaseAt: '2026-11-06T20:00:00.000Z', partnerAmountMinor: 20000 }),
          entry({ id: 'c', releaseAt: '2026-11-06T20:00:00.000Z', accountKey: 'acc2' }),
          entry({
            id: 'held',
            status: 'on_hold',
            holdReasons: ['claim'],
            partnerAmountMinor: 3400,
          }),
          entry({ id: 'd', releaseAt: '2026-12-22T13:00:00.000Z', offsetMinor: 500 }),
        ],
      })
    );
    expect(view.payouts.map((group) => [group.status, group.amountMinor])).toEqual([
      ['scheduled', 45500],
      ['scheduled', 25500],
      ['scheduled', 25000],
      ['held', 3400],
    ]);
    expect(view.payouts[0]?.account).toEqual({
      maskedDocument: '••••/0001-81',
      name: 'Buggy do Preá',
    });
    expect(view.payouts[0]?.lines.map((line) => line.id)).toEqual(['a', 'b']);
    expect(view.payouts[3]?.holdReasons).toEqual(['claim']);
    expect(view.toReceiveMinor).toBe(45500 + 25500 + 25000 + 3400);
    expect(view.accounts).toEqual({ count: 2, ready: 1 });
  });

  it('pagos: só o mês atual soma em "Recebido", do mais recente para o antigo', () => {
    const view = buildPartnerEarnings(
      input({
        released: [
          entry({ id: 'nov', status: 'released', releasedAt: '2026-11-01T15:00:00.000Z' }),
          entry({ id: 'out', status: 'released', releasedAt: '2026-10-30T15:00:00.000Z' }),
        ],
      })
    );
    expect(view.receivedThisMonthMinor).toBe(25500);
    expect(view.payouts.map((group) => [group.status, group.lines[0]?.id])).toEqual([
      ['paid', 'nov'],
      ['paid', 'out'],
    ]);
  });
});
