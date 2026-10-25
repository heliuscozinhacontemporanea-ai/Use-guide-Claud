import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCollection, mockRunTransaction } = vi.hoisted(() => ({
  mockCollection: vi.fn(),
  mockRunTransaction: vi.fn(),
}));

vi.mock('../../../infrastructure/firebase/adminClient', () => ({
  adminDb: {
    collection: mockCollection,
    runTransaction: mockRunTransaction,
  },
}));

import { FirestoreTicketingAdapter } from './firestoreTicketingAdapter';

describe('FirestoreTicketingAdapter.updateRefundStatus', () => {
  let adapter: FirestoreTicketingAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirestoreTicketingAdapter();
  });

  it('é idempotente quando o reembolso já está approved (não decrementa estoque novamente)', async () => {
    const refundRef = { id: 'ref_1' };
    mockCollection.mockImplementation((name: string) => {
      if (name === 'ticketRefunds') {
        return { doc: vi.fn().mockReturnValue(refundRef) };
      }
      return { doc: vi.fn(), where: vi.fn() };
    });

    const txGet = vi.fn().mockResolvedValue({
      exists: true,
      id: 'ref_1',
      data: () => ({
        orderId: 'order_1',
        ticketId: 'ticket_1',
        requesterUid: 'user_1',
        amountMinor: 5000,
        reason: 'Solicitado pelo comprador',
        status: 'approved',
        providerRefundId: 're_stripe_1',
        idempotencyKey: 'idem_1',
        createdAt: '2026-10-09T00:00:00.000Z',
        completedAt: '2026-10-09T00:01:00.000Z',
      }),
    });
    const txUpdate = vi.fn();

    mockRunTransaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({ get: txGet, update: txUpdate })
    );

    const result = await adapter.updateRefundStatus('ref_1', 'approved', 're_stripe_1');

    expect(result.status).toBe('approved');
    expect(txUpdate).not.toHaveBeenCalled();
  });

  it('executa todas as leituras antes das escritas ao aprovar reembolso e decrementa soldCount uma única vez por ingresso', async () => {
    const callOrder: string[] = [];
    const refundRef = { id: 'ref_1', path: 'ticketRefunds/ref_1' };
    const orderRef = { id: 'order_1', path: 'ticketOrders/order_1' };
    const ticketRef = { id: 'ticket_1', path: 'tickets/ticket_1' };
    const typeRef = { id: 'type_1', path: 'ticketTypes/type_1' };
    const ticketsQuery = { query: 'tickets_by_order' };

    mockCollection.mockImplementation((name: string) => {
      if (name === 'ticketRefunds') return { doc: () => refundRef };
      if (name === 'ticketOrders') return { doc: () => orderRef };
      if (name === 'tickets') return { where: () => ticketsQuery };
      if (name === 'ticketTypes') return { doc: () => typeRef };
      return { doc: vi.fn() };
    });

    const txGet = vi.fn().mockImplementation(async (target: unknown) => {
      callOrder.push('get');
      if (target === refundRef) {
        return {
          exists: true,
          id: 'ref_1',
          data: () => ({
            orderId: 'order_1',
            ticketId: 'ticket_1',
            requesterUid: 'user_1',
            amountMinor: 5000,
            reason: 'Teste',
            status: 'processing',
            providerRefundId: 're_stripe_1',
            idempotencyKey: 'idem_1',
            createdAt: '2026-10-09T00:00:00.000Z',
          }),
        };
      }
      if (target === ticketsQuery) {
        return {
          docs: [
            {
              id: 'ticket_1',
              ref: ticketRef,
              data: () => ({
                orderId: 'order_1',
                occurrenceId: 'occ_1',
                eventId: 'evt_1',
                ticketTypeId: 'type_1',
                holderUid: 'user_1',
                holderName: 'User',
                holderEmail: 'user@example.com',
                qrSecret: 'secret',
                status: 'refund_pending',
                issuedAt: '2026-10-09T00:00:00.000Z',
              }),
            },
          ],
        };
      }
      if (target === typeRef) {
        return {
          exists: true,
          id: 'type_1',
          data: () => ({
            occurrenceId: 'occ_1',
            eventId: 'evt_1',
            name: 'Lote 1',
            priceMinor: 5000,
            capacity: 100,
            soldCount: 10,
            reservedCount: 0,
            maxPerOrder: 4,
            salesStartAt: '2026-10-01T00:00:00.000Z',
            salesEndAt: '2026-10-10T00:00:00.000Z',
            isActive: true,
            createdAt: '2026-10-01T00:00:00.000Z',
            updatedAt: '2026-10-01T00:00:00.000Z',
          }),
        };
      }
      throw new Error('Unexpected target');
    });

    const txUpdate = vi.fn().mockImplementation(() => {
      callOrder.push('update');
    });

    mockRunTransaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({ get: txGet, update: txUpdate })
    );

    const result = await adapter.updateRefundStatus('ref_1', 'approved', 're_stripe_1');

    expect(result.status).toBe('approved');
    const firstUpdateIndex = callOrder.indexOf('update');
    const lastGetIndex = callOrder.lastIndexOf('get');
    expect(lastGetIndex).toBeLessThan(firstUpdateIndex);

    expect(txUpdate).toHaveBeenCalledWith(typeRef, expect.objectContaining({ soldCount: 9 }));
  });

  it('reverte ingressos de refund_pending para issued quando o reembolso falha', async () => {
    const refundRef = { id: 'ref_1' };
    const ticketRef = { id: 'ticket_1' };
    const ticketsQuery = { query: 'tickets_by_order' };

    mockCollection.mockImplementation((name: string) => {
      if (name === 'ticketRefunds') return { doc: () => refundRef };
      if (name === 'tickets') return { where: () => ticketsQuery };
      return { doc: vi.fn() };
    });

    const txGet = vi.fn().mockImplementation(async (target: unknown) => {
      if (target === refundRef) {
        return {
          exists: true,
          id: 'ref_1',
          data: () => ({
            orderId: 'order_1',
            ticketId: 'ticket_1',
            requesterUid: 'user_1',
            amountMinor: 5000,
            reason: 'Teste',
            status: 'processing',
            providerRefundId: 're_stripe_1',
            idempotencyKey: 'idem_1',
            createdAt: '2026-10-09T00:00:00.000Z',
          }),
        };
      }
      if (target === ticketsQuery) {
        return {
          docs: [
            {
              id: 'ticket_1',
              ref: ticketRef,
              data: () => ({
                orderId: 'order_1',
                occurrenceId: 'occ_1',
                eventId: 'evt_1',
                ticketTypeId: 'type_1',
                holderUid: 'user_1',
                holderName: 'User',
                holderEmail: 'user@example.com',
                qrSecret: 'secret',
                status: 'refund_pending',
                issuedAt: '2026-10-09T00:00:00.000Z',
              }),
            },
          ],
        };
      }
      throw new Error('Unexpected target');
    });

    const txUpdate = vi.fn();

    mockRunTransaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({ get: txGet, update: txUpdate })
    );

    const result = await adapter.updateRefundStatus('ref_1', 'failed', 're_stripe_1');

    expect(result.status).toBe('failed');
    expect(txUpdate).toHaveBeenCalledWith(ticketRef, { status: 'issued' });
  });
});
