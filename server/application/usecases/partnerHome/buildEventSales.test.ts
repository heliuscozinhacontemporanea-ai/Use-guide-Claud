import { describe, expect, it } from 'vitest';
import type { PayoutEntryView } from '../../../domain/payment';
import type { Refund, Ticket, TicketOrder } from '../../../domain/ticketing';
import { buildEventSales } from './buildEventSales';

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

const names = new Map([
  ['buyer-a', 'Ana Souza'],
  ['buyer-bb', 'Carlos Melo'],
  ['buyer-ccc', null],
]);

describe('buildEventSales', () => {
  it('mostra pagos e reembolsos, sem e-mail nem documento, e soma o vendido sem a taxa', () => {
    const result = buildEventSales({
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
      entries: [
        { partnerAmountMinor: 18000, status: 'pending' },
        { partnerAmountMinor: 5000, status: 'canceled' },
      ] as PayoutEntryView[],
      names,
    });

    expect(result.orders.map((row) => [row.code, row.status])).toEqual([
      ['ccc', 'refunded'],
      ['bb', 'refund_requested'],
      ['a', 'paid'],
    ]);
    expect(result.orders[2]).toMatchObject({
      buyerName: 'Ana Souza',
      tickets: 2,
      lines: [{ name: 'Pista', unitPriceMinor: 10000, quantity: 2 }],
      serviceFeeMinor: 600,
      refund: null,
    });
    expect(result.orders[1]?.refund).toMatchObject({ state: 'in_progress', full: true });
    expect(result.orders[0]?.buyerName).toBeNull();
    expect(JSON.stringify(result)).not.toContain('segredo');
    expect(JSON.stringify(result)).not.toContain('Nome Completo');
    // a + bb (o reembolso de bb ainda não saiu); ccc já voltou inteiro.
    expect(result.soldMinor).toBe(40000);
    expect(result.ticketsSold).toBe(4);
    expect(result.receiveMinor).toBe(18000);
    expect(result.ordersTotal).toBe(3);
  });

  it('reembolso parcial aprovado sai do vendido só pela parte do ingresso', () => {
    const result = buildEventSales({
      orders: [order('a', { status: 'partially_refunded' })],
      tickets: [ticket('a'), ticket('a', 'refunded')],
      refunds: [refund('a', { status: 'approved', amountMinor: 10000, serviceFeeMinor: 0 })],
      entries: [],
      names,
    });
    expect(result.orders[0]).toMatchObject({
      status: 'partially_refunded',
      refund: { state: 'done', amountMinor: 10000, full: false },
    });
    expect(result.soldMinor).toBe(10000);
  });

  it('disputa aparece como disputa', () => {
    const result = buildEventSales({
      orders: [order('a', { status: 'chargeback' })],
      tickets: [],
      refunds: [],
      entries: [],
      names,
    });
    expect(result.orders[0]?.status).toBe('disputed');
  });
});
