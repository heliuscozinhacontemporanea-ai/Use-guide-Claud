import { describe, expect, it } from 'vitest';
import type { PayoutEntryView } from '../../../domain/payment';
import type { Refund, Ticket, TicketOrder } from '../../../domain/ticketing';
import { buildEventOrderRows, buildEventSales } from './buildEventSales';

function order(id: string, overrides: Partial<TicketOrder> = {}): TicketOrder {
  return {
    id,
    buyerId: `buyer-${id}`,
    eventListingId: 'ev1',
    occurrenceId: 'occ1',
    status: 'paid',
    subtotalMinor: 20000,
    discountMinor: 0,
    serviceFeeMinor: 600,
    totalMinor: 20600,
    createdAt: `2026-11-0${id.length}T12:00:00.000Z`,
    buyerSnapshot: { name: 'Nome Completo', email: 'segredo@exemplo.com', document: '123' },
    ...overrides,
  } as unknown as TicketOrder;
}

function ticket(orderId: string, status: Ticket['status'] = 'issued'): Ticket {
  return {
    id: `${orderId}-${Math.random()}`,
    orderId,
    status,
    ticketTypeSnapshot: { name: 'Pista', kind: 'paid', unitPriceMinor: 10000 },
    holderEmail: 'segredo@exemplo.com',
  } as unknown as Ticket;
}

function refund(orderId: string, overrides: Partial<Refund>): Refund {
  return {
    id: `r-${orderId}`,
    orderId,
    amountMinor: 20600,
    serviceFeeMinor: 600,
    status: 'requested',
    createdAt: '2026-11-05T12:00:00.000Z',
    ...overrides,
  } as unknown as Refund;
}

function entry(overrides: Partial<PayoutEntryView>): PayoutEntryView {
  return {
    grossMinor: 20600,
    serviceFeeMinor: 600,
    refundedMinor: 0,
    platformFeeMinor: 2000,
    partnerAmountMinor: 18000,
    offsetMinor: 0,
    status: 'pending',
    ...overrides,
  } as PayoutEntryView;
}

function both(input: Parameters<typeof buildEventSales>[0]) {
  return {
    ...buildEventSales(input),
    orders: buildEventOrderRows(input).map((row) => row.view),
    buyers: buildEventOrderRows(input).map((row) => row.buyerId),
  };
}

describe('buildEventSales', () => {
  it('mostra pagos e reembolsos, sem e-mail nem documento, e soma o vendido sem a taxa', () => {
    const result = both({
      orders: [
        order('a'),
        order('bb'),
        order('ccc', { status: 'refunded' }),
        order('dddd', { status: 'pending_payment' }),
        order('eeeee', { status: 'canceled' }),
      ],
      tickets: [
        ticket('a'),
        ticket('a'),
        ticket('bb'),
        ticket('bb'),
        ticket('ccc', 'refunded'),
        ticket('ccc', 'transferred'),
      ],
      refunds: [refund('bb', {}), refund('ccc', { status: 'approved' })],
      entries: [entry({}), entry({ partnerAmountMinor: 5000, status: 'canceled' })],
    });

    expect(result.orders.map((row) => [row.code, row.status])).toEqual([
      ['ccc', 'refunded'],
      ['bb', 'refund_requested'],
      ['a', 'paid'],
    ]);
    expect(result.buyers).toEqual(['buyer-ccc', 'buyer-bb', 'buyer-a']);
    expect(result.orders[2]).toMatchObject({
      buyerName: null,
      tickets: 2,
      lines: [{ name: 'Pista', unitPriceMinor: 10000, quantity: 2 }],
      serviceFeeMinor: 600,
      refund: null,
    });
    expect(result.orders[1]?.refund).toMatchObject({ state: 'in_progress', full: true });
    expect(JSON.stringify(result)).not.toContain('segredo');
    expect(JSON.stringify(result)).not.toContain('Nome Completo');
    // a + bb (o reembolso de bb ainda não saiu); ccc já voltou inteiro.
    expect(result.soldMinor).toBe(40000);
    expect(result.ticketsSold).toBe(4);
    expect(result.receiveMinor).toBe(18000);
    expect(result.ordersTotal).toBe(3);
  });

  it('reembolso parcial aprovado sai do vendido só pela parte do ingresso', () => {
    const result = both({
      orders: [order('a', { status: 'partially_refunded' })],
      tickets: [ticket('a'), ticket('a', 'refunded')],
      refunds: [refund('a', { status: 'approved', amountMinor: 10000, serviceFeeMinor: 0 })],
      entries: [],
    });
    expect(result.orders[0]).toMatchObject({
      status: 'partially_refunded',
      refund: { state: 'done', amountMinor: 10000, full: false },
    });
    expect(result.soldMinor).toBe(10000);
  });

  it('disputa aparece como disputa', () => {
    const result = both({
      orders: [order('a', { status: 'chargeback' })],
      tickets: [],
      refunds: [],
      entries: [],
    });
    expect(result.orders[0]?.status).toBe('disputed');
  });

  it('abre a conta de "Você recebe" e ela fecha com cupom, reembolso parcial e multa (A4)', () => {
    const result = buildEventSales({
      orders: [
        order('a', { discountMinor: 2000, totalMinor: 18600 }),
        order('bb', { status: 'partially_refunded' }),
      ],
      tickets: [ticket('a'), ticket('a'), ticket('bb'), ticket('bb', 'refunded')],
      refunds: [refund('bb', { status: 'approved', amountMinor: 10300, serviceFeeMinor: 300 })],
      entries: [
        entry({ grossMinor: 18600, platformFeeMinor: 1800, partnerAmountMinor: 16200 }),
        entry({
          serviceFeeMinor: 300,
          refundedMinor: 10300,
          platformFeeMinor: 1000,
          partnerAmountMinor: 9000,
          offsetMinor: 500,
        }),
      ],
    });
    const { breakdown } = result;
    expect(breakdown).toEqual({
      ticketsMinor: 40000,
      discountMinor: 2000,
      refundedMinor: 10000,
      platformFeeMinor: 2800,
      feeBaseMinor: 28000,
      adjustmentsMinor: 500,
      buyerServiceFeeMinor: 900,
    });
    expect(breakdown.ticketsMinor - breakdown.discountMinor - breakdown.refundedMinor).toBe(
      result.soldMinor
    );
    expect(result.soldMinor - breakdown.platformFeeMinor - breakdown.adjustmentsMinor).toBe(
      result.receiveMinor
    );
    expect(result.receiveMinor).toBe(24700);
  });
});
