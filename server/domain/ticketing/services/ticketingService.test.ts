import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingService } from './ticketingService';
import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketType } from '../types/ticketingTypes';

vi.mock('../../events', () => ({
  EventNotFoundError: class extends Error {
    code = 'NOT_FOUND';
  },
  EventOwnershipError: class extends Error {
    code = 'FORBIDDEN';
  },
  getEventListingByIdUseCase: vi.fn(),
  getEventOccurrenceByIdUseCase: vi.fn(),
  recordEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
  createEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
  updateEventListingPricingSummaryUseCase: vi.fn().mockResolvedValue(undefined),
}));

import {
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
} from '../../events';

function createMockTicketType(overrides: Partial<TicketType> = {}): TicketType {
  return {
    id: 'tt_1',
    occurrenceId: 'occ_1',
    eventListingId: 'evt_1',
    name: '1º Lote',
    kind: 'paid',
    priceMinor: 5000,
    currency: 'BRL',
    quantity: 50,
    soldCount: 0,
    reservedCount: 0,
    minPerOrder: 1,
    maxPerOrder: 5,
    status: 'on_sale',
    visibility: 'public',
    requiresEligibilityProof: false,
    sortOrder: 0,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('TicketingService', () => {
  let mockPort: TicketingPort;
  let service: TicketingService;

  beforeEach(() => {
    vi.stubEnv('TICKET_QR_SECRET', 'test-ticket-qr-secret-with-32-chars!');
    vi.clearAllMocks();

    vi.mocked(getEventOccurrenceByIdUseCase).mockResolvedValue({
      id: 'occ_1',
      eventListingId: 'evt_1',
      startsAt: '2026-12-20T20:00:00.000Z',
      endsAt: '2026-12-21T02:00:00.000Z',
      status: 'scheduled',
      capacity: 100,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    vi.mocked(getEventListingByIdUseCase).mockResolvedValue({
      id: 'evt_1',
      ownerId: 'partner_1',
      partnerId: 'partner_1',
      organizerId: 'partner_1',
      title: 'Sunset Kitesurf Party',
      name: 'Sunset Kitesurf Party',
      summary: 'Festa',
      description: 'Festa na praia',
      category: 'party',
      eventCategory: 'party',
      coverImage: 'https://example.com/img.jpg',
      image: 'https://example.com/img.jpg',
      images: [],
      visibility: 'public',
      status: 'published',
      isActive: true,
      location: { name: 'Praia do Preá' },
      contact: {},
      refundPolicy: { enabled: true, cancellationWindowHours: 48 },
      entryType: 'pago',
      pricingMode: 'paid',
      ratingSummary: { average: 0, count: 0 },
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    mockPort = {
      createTicketType: vi.fn().mockImplementation(async (input) =>
        createMockTicketType({ ...input, id: 'tt_created' })
      ),
      getTicketTypeById: vi.fn().mockResolvedValue(createMockTicketType()),
      listTicketTypesByOccurrenceId: vi.fn().mockResolvedValue([createMockTicketType()]),
      updateTicketType: vi.fn().mockImplementation(async (_id, patch) =>
        createMockTicketType(patch)
      ),
      deleteTicketType: vi.fn().mockResolvedValue(undefined),
      reserveInventoryAndCreateOrderAtomic: vi.fn().mockImplementation(async (input) => ({
        order: {
          id: 'ord_1',
          buyerId: input.buyerId,
          eventListingId: input.eventListingId,
          occurrenceId: input.occurrenceId,
          status: input.issueImmediately ? 'paid' : 'pending_payment',
          currency: 'BRL',
          subtotalMinor: input.subtotalMinor,
          discountMinor: input.discountMinor,
          platformFeeMinor: input.platformFeeMinor,
          paymentFeeMinor: input.paymentFeeMinor,
          totalMinor: input.totalMinor,
          buyerSnapshot: input.buyerSnapshot,
          refundPolicySnapshot: input.refundPolicySnapshot,
          idempotencyKey: input.idempotencyKey,
          createdAt: '2026-10-05T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z',
        },
        items: [],
        reservations: [],
        issuedTickets: [],
        isIdempotentReplay: false,
      })),
      confirmOrderPaymentAndIssueTicketsAtomic: vi.fn(),
      expireOrderAndReleaseInventoryAtomic: vi.fn(),
      getOrderById: vi.fn(),
      getOrderByIdempotencyKey: vi.fn(),
      listOrderItemsByOrderId: vi.fn().mockResolvedValue([]),
      listOrdersByBuyerId: vi.fn().mockResolvedValue([]),
      listOrdersByOccurrenceId: vi.fn().mockResolvedValue([]),
      listOrdersByEventListingId: vi.fn().mockResolvedValue([]),
      listExpiredPendingOrders: vi.fn().mockResolvedValue([]),
      updateOrderStatus: vi.fn(),
      getTicketById: vi.fn(),
      getTicketByQrTokenHash: vi.fn(),
      listTicketsByOrderId: vi.fn().mockResolvedValue([]),
      listTicketsByOwnerUserId: vi.fn().mockResolvedValue([]),
      listTicketsByOccurrenceId: vi.fn().mockResolvedValue([]),
      listTicketsByEventListingId: vi.fn().mockResolvedValue([]),
      updateTicketStatus: vi.fn(),
      checkInTicketAtomic: vi.fn(),
      listCheckInsByOccurrenceId: vi.fn().mockResolvedValue([]),
      listCheckInsByEventListingId: vi.fn().mockResolvedValue([]),
      createRefundAtomic: vi.fn(),
      updateRefundStatus: vi.fn(),
      getRefundById: vi.fn(),
      listRefundsByOrderId: vi.fn().mockResolvedValue([]),
      listRefundsByEventListingId: vi.fn().mockResolvedValue([]),
      transferTicketAtomic: vi.fn(),
      moveOrdersAndTicketsToOccurrenceAtomic: vi.fn(),
      createPromoCode: vi.fn(),
      getPromoCodeByCode: vi.fn().mockResolvedValue(null),
      createWaitlistEntry: vi.fn(),
      listWaitlistByOccurrenceId: vi.fn().mockResolvedValue([]),
      createOfflineCheckInSession: vi.fn(),
      getOfflineCheckInSessionById: vi.fn(),
      syncOfflineCheckInsAtomic: vi.fn(),
    };

    const mockQrTokenPort = {
      issue: vi.fn().mockReturnValue('ugt2.mock.sig'),
      verify: vi.fn(),
      getPublicKeyMetadata: vi.fn().mockReturnValue({
        keyId: 'key_mock',
        publicKeyJwk: { kty: 'RSA' },
      }),
    };

    service = new TicketingService(mockPort, mockQrTokenPort);
  });

  it('prevents changing priceMinor on a ticketType with existing sales or reservations', async () => {
    vi.mocked(mockPort.getTicketTypeById).mockResolvedValueOnce(
      createMockTicketType({ soldCount: 2 })
    );

    await expect(
      service.updateTicketType({ uid: 'partner_1' }, 'tt_1', { priceMinor: 8000 })
    ).rejects.toThrow(/Não é permitido alterar o preço/);
  });

  it('creates an order with minor units and calculates platform fee without floating point errors', async () => {
    const res = await service.createTicketOrder(
      { uid: 'buyer_1' },
      {
        occurrenceId: 'occ_1',
        items: [{ ticketTypeId: 'tt_1', quantity: 2 }],
        buyer: { name: 'Maria', email: 'maria@example.com' },
        idempotencyKey: 'idem_12345678',
      }
    );

    expect(res.order.subtotalMinor).toBe(10000);
    expect(res.order.platformFeeMinor).toBe(1000);
    expect(res.order.totalMinor).toBe(10000);
    expect(res.order.status).toBe('pending_payment');
  });

  it('validates verified attendance for review only when ticket is checked_in and occurrence completed', async () => {
    vi.mocked(mockPort.getTicketById).mockResolvedValueOnce({
      id: 'tkt_1',
      orderId: 'ord_1',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      ticketTypeId: 'tt_1',
      ownerUserId: 'buyer_1',
      holderName: 'Maria',
      holderEmail: 'maria@example.com',
      qrTokenHash: 'hash_123',
      qrVersion: 1,
      status: 'checked_in',
      issuedAt: '2026-10-01T10:00:00.000Z',
      checkedInAt: '2026-12-20T21:00:00.000Z',
    });

    vi.mocked(getEventOccurrenceByIdUseCase).mockResolvedValueOnce({
      id: 'occ_1',
      eventListingId: 'evt_1',
      startsAt: '2025-01-01T20:00:00.000Z',
      endsAt: '2025-01-02T02:00:00.000Z',
      status: 'completed',
      capacity: 100,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-02T02:00:00.000Z',
    });

    const verified = await service.getVerifiedAttendanceForReview({
      userId: 'buyer_1',
      occurrenceId: 'occ_1',
      ticketId: 'tkt_1',
    });

    expect(verified.eligible).toBe(true);
    expect(verified.eventListingId).toBe('evt_1');
  });

  it('rejects verified attendance when ticket is refunded or not checked in', async () => {
    vi.mocked(mockPort.getTicketById).mockResolvedValueOnce({
      id: 'tkt_ref',
      orderId: 'ord_1',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      ticketTypeId: 'tt_1',
      ownerUserId: 'buyer_1',
      holderName: 'Maria',
      holderEmail: 'maria@example.com',
      qrTokenHash: 'hash_ref',
      qrVersion: 1,
      status: 'refunded',
      issuedAt: '2026-10-01T10:00:00.000Z',
    });

    await expect(
      service.getVerifiedAttendanceForReview({
        userId: 'buyer_1',
        occurrenceId: 'occ_1',
        ticketId: 'tkt_ref',
      })
    ).rejects.toThrow();
  });

  it('issues free tickets immediately without payment provider when totalMinor is 0', async () => {
    vi.mocked(mockPort.listTicketTypesByOccurrenceId).mockResolvedValueOnce([
      createMockTicketType({ id: 'tt_free', kind: 'free', priceMinor: 0 }),
    ]);

    const res = await service.createTicketOrder(
      { uid: 'buyer_free' },
      {
        occurrenceId: 'occ_1',
        items: [{ ticketTypeId: 'tt_free', quantity: 2 }],
        buyer: { name: 'João', email: 'joao@example.com' },
        idempotencyKey: 'idem_free_1',
      }
    );

    expect(res.order.totalMinor).toBe(0);
    expect(res.order.status).toBe('paid');
    expect(mockPort.reserveInventoryAndCreateOrderAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        issueImmediately: true,
        totalMinor: 0,
      })
    );
  });

  it('rejects order when requested quantity exceeds occurrence global capacity', async () => {
    vi.mocked(getEventOccurrenceByIdUseCase).mockResolvedValueOnce({
      id: 'occ_1',
      eventListingId: 'evt_1',
      startsAt: '2026-12-20T20:00:00.000Z',
      endsAt: '2026-12-21T02:00:00.000Z',
      status: 'scheduled',
      capacity: 8,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    vi.mocked(mockPort.listTicketTypesByOccurrenceId).mockResolvedValueOnce([
      createMockTicketType({ id: 'tt_a', quantity: 5, soldCount: 4 }),
      createMockTicketType({ id: 'tt_b', quantity: 5, soldCount: 3 }),
    ]);

    await expect(
      service.createTicketOrder(
        { uid: 'buyer_1' },
        {
          occurrenceId: 'occ_1',
          items: [{ ticketTypeId: 'tt_b', quantity: 2 }],
          buyer: { name: 'Pedro', email: 'pedro@example.com' },
          idempotencyKey: 'idem_cap_exceed',
        }
      )
    ).rejects.toThrow(/não está disponível para compra|esgotar|Restam apenas/);
  });

  it('enforces buyer ownership on getTicketOrder and denies cross-user access', async () => {
    vi.mocked(mockPort.getOrderById).mockResolvedValueOnce({
      id: 'ord_secret',
      buyerId: 'user_b',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      status: 'paid',
      currency: 'BRL',
      subtotalMinor: 5000,
      discountMinor: 0,
      platformFeeMinor: 500,
      paymentFeeMinor: 0,
      totalMinor: 5000,
      buyerSnapshot: { name: 'User B', email: 'b@example.com' },
      refundPolicySnapshot: {
        enabled: true,
        allowBuyerCancellation: true,
        allowTicketTransfer: true,
      },
      idempotencyKey: 'idem_b',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    await expect(service.getOrderForUser({ uid: 'user_a' }, 'ord_secret')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('denies partner A from viewing sales analytics or checking in tickets of partner B event', async () => {
    await expect(
      service.getEventSalesAnalytics({ uid: 'partner_other', admin: false }, 'evt_1')
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });

    await expect(
      service.checkInTicket(
        { uid: 'partner_other', admin: false },
        { occurrenceId: 'occ_1', ticketId: 'tkt_1' }
      )
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('allows admin to view sales analytics without changing event ownerId', async () => {
    const analytics = await service.getEventSalesAnalytics(
      { uid: 'admin_1', admin: true },
      'evt_1'
    );
    expect(analytics.grossSalesMinor).toBe(0);
  });

  it('transfers ticket atomically and invalidates previous holder ticket', async () => {
    vi.mocked(mockPort.getTicketById).mockResolvedValueOnce({
      id: 'tkt_orig',
      orderId: 'ord_1',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      ticketTypeId: 'tt_1',
      ownerUserId: 'user_from',
      holderName: 'User From',
      holderEmail: 'from@example.com',
      qrTokenHash: 'old_hash',
      qrVersion: 1,
      status: 'issued',
      issuedAt: '2026-10-01T10:00:00.000Z',
    });

    vi.mocked(mockPort.transferTicketAtomic).mockResolvedValueOnce({
      transfer: {
        id: 'tr_1',
        ticketId: 'tkt_orig',
        fromUserId: 'user_from',
        toUserId: 'user_to',
        recipientEmail: 'to@example.com',
        status: 'completed',
        expiresAt: '2026-10-06T00:00:00.000Z',
        createdAt: '2026-10-05T00:00:00.000Z',
        completedAt: '2026-10-05T00:00:00.000Z',
      },
      oldTicket: {
        id: 'tkt_orig',
        orderId: 'ord_1',
        eventListingId: 'evt_1',
        occurrenceId: 'occ_1',
        ticketTypeId: 'tt_1',
        ownerUserId: 'user_from',
        holderName: 'User From',
        holderEmail: 'from@example.com',
        qrTokenHash: 'old_hash',
        qrVersion: 1,
        status: 'transferred',
        issuedAt: '2026-10-01T10:00:00.000Z',
      },
      newTicket: {
        id: 'tkt_new',
        orderId: 'ord_1',
        eventListingId: 'evt_1',
        occurrenceId: 'occ_1',
        ticketTypeId: 'tt_1',
        ownerUserId: 'user_to',
        holderName: 'User To',
        holderEmail: 'to@example.com',
        qrTokenHash: 'new_hash',
        qrVersion: 2,
        status: 'issued',
        issuedAt: '2026-10-05T00:00:00.000Z',
      },
    });

    const res = await service.transferTicket(
      { uid: 'user_from' },
      {
        ticketId: 'tkt_orig',
        recipientEmail: 'to@example.com',
        recipientName: 'User To',
        toUserId: 'user_to',
      }
    );

    expect(res.oldTicket.status).toBe('transferred');
    expect(res.newTicket.status).toBe('issued');
    expect(res.newTicket.qrTokenHash).not.toBe(res.oldTicket.qrTokenHash);
  });
});
