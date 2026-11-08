import { describe, expect, it } from 'vitest';
import type { Ticket, TicketOrder } from '../types/ticketing';
import { ticketPurchaseSection } from './ticketPurchaseSection';
import {
  canRequestRefund,
  canTransferTicket,
  previewOrderRefund,
  previewOrderRefundMinor,
} from './ticketWalletRules';

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

describe('pedido no histórico de Compras', () => {
  it('a prévia informa o motivo e até quando vale (moderada: integral até 7 dias antes)', () => {
    expect(previewOrderRefund(order(), daysBefore(10))).toMatchObject({
      reason: 'policy',
      refundMinor: 10000,
      serviceFeeRefundMinor: 0,
      until: daysBefore(7).toISOString(),
    });
    expect(previewOrderRefund(order({ status: 'pending_payment' }), daysBefore(10))).toBeNull();
  });

  it('pago em Finalizadas, aguardando em Pendentes, expirado ou devolvido em Canceladas', () => {
    const now = daysBefore(10);
    const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString();
    expect(ticketPurchaseSection(order(), now)).toBe('done');
    expect(ticketPurchaseSection(order({ status: 'partially_refunded' }), now)).toBe('done');
    expect(ticketPurchaseSection(order({ status: 'payment_processing' }), now)).toBe('pending');
    expect(
      ticketPurchaseSection(order({ status: 'pending_payment', expiresAt: inMinutes(10) }), now)
    ).toBe('pending');
    expect(
      ticketPurchaseSection(order({ status: 'payment_failed', expiresAt: inMinutes(-1) }), now)
    ).toBe('canceled');
    expect(ticketPurchaseSection(order({ status: 'refunded' }), now)).toBe('canceled');
  });
});
