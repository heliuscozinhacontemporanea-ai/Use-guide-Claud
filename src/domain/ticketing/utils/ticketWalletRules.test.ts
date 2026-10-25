import { describe, expect, it } from 'vitest';
import type { Ticket, TicketOrder } from '../types/ticketing';
import { canRequestRefund, canTransferTicket, previewOrderRefundMinor } from './ticketWalletRules';

const STARTS = '2026-12-20T22:00:00.000Z';

function order(overrides: Partial<TicketOrder> = {}): TicketOrder {
  return {
    id: 'ord_1',
    buyerId: 'u1',
    eventListingId: 'ev1',
    occurrenceId: 'occ1',
    status: 'paid',
    currency: 'BRL',
    subtotalMinor: 10000,
    discountMinor: 0,
    platformFeeMinor: 1000,
    paymentFeeMinor: 0,
    serviceFeeMinor: 600,
    totalMinor: 10600,
    buyerSnapshot: { name: 'Ana', email: 'ana@example.com' },
    eventSnapshot: { title: 'Show', startsAt: STARTS, endsAt: STARTS },
    salesPolicySnapshot: {
      cancellationPolicy: 'moderate',
      serviceFeeMode: 'pass_to_buyer',
      allowTicketTransfer: true,
      ticketTransferCutoffHours: 4,
    },
    paidAt: '2026-10-01T12:00:00.000Z',
    idempotencyKey: 'k',
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

const ticket = (status: Ticket['status']) =>
  ({ id: 't1', orderId: 'ord_1', status, eventSnapshot: { startsAt: STARTS } }) as Ticket;
const daysBefore = (days: number) => new Date(new Date(STARTS).getTime() - days * 86_400_000);

describe('regras da carteira de ingressos', () => {
  it('pela política, devolve só o valor do ingresso, sem a taxa de serviço', () => {
    expect(previewOrderRefundMinor(order(), daysBefore(10))).toBe(10000);
    expect(previewOrderRefundMinor(order(), daysBefore(3))).toBe(0);
  });

  it('no arrependimento devolve tudo, inclusive a taxa de serviço', () => {
    const recent = order({ paidAt: '2026-12-14T12:00:00.000Z' });
    expect(previewOrderRefundMinor(recent, daysBefore(3))).toBe(10600);
  });

  it('ingresso utilizado impede o reembolso; transferência respeita o prazo', () => {
    expect(canRequestRefund(order(), [ticket('checked_in')], daysBefore(10))).toBe(false);
    expect(canRequestRefund(order(), [ticket('issued')], daysBefore(10))).toBe(true);
    const lastHours = new Date(new Date(STARTS).getTime() - 2 * 3_600_000);
    expect(canTransferTicket(ticket('issued'), order(), lastHours)).toBe(false);
    expect(canTransferTicket(ticket('issued'), order(), daysBefore(1))).toBe(true);
  });
});
