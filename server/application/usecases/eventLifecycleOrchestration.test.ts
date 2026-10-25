import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelEventOccurrenceAndRefundApplicationUseCase } from './cancelEventOccurrenceAndRefundApplicationUseCase';
import { postponeEventOccurrenceAndNotifyApplicationUseCase } from './postponeEventOccurrenceAndNotifyApplicationUseCase';
import {
  cancelEventOccurrenceUseCase,
  getEventListingByIdUseCase,
  postponeEventOccurrenceUseCase,
  type EventListing,
  type EventOccurrence,
} from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  moveOrderToOccurrenceUseCase,
  type Refund,
  type TicketOrder,
} from '../../domain/ticketing';
import { chargeCancellationPenaltyApplicationUseCase } from './payouts/chargeCancellationPenaltyApplicationUseCase';
import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';

vi.mock('../../domain/events', () => ({
  cancelEventOccurrenceUseCase: vi.fn(),
  getEventListingByIdUseCase: vi.fn(),
  postponeEventOccurrenceUseCase: vi.fn(),
  listEventOccurrencesUseCase: vi.fn(),
  archiveEventListingUseCase: vi.fn(),
}));

vi.mock('../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../domain/ticketing', () => ({
  listEventOrdersForPartnerOrAdminUseCase: vi.fn(),
  listEventRefundsForPartnerOrAdminUseCase: vi.fn().mockResolvedValue([]),
  listEventCheckInsForPartnerOrAdminUseCase: vi.fn().mockResolvedValue([]),
  listTicketTypesForManagementUseCase: vi.fn().mockResolvedValue([]),
  moveOrderToOccurrenceUseCase: vi.fn(),
}));

vi.mock('./payouts/chargeCancellationPenaltyApplicationUseCase', () => ({
  chargeCancellationPenaltyApplicationUseCase: vi.fn().mockResolvedValue(0),
}));

vi.mock('./processTicketRefundApplicationUseCase', () => ({
  processTicketRefundApplicationUseCase: vi.fn(),
}));

describe('eventLifecycleOrchestrationUseCases', () => {
  const actor = { uid: 'partner-1', admin: false, role: 'partner' };

  const sampleOccurrence: EventOccurrence = {
    id: 'occ-1',
    eventListingId: 'ev-1',
    startsAt: '2026-09-10T20:00:00.000Z',
    endsAt: '2026-09-10T23:59:00.000Z',
    status: 'canceled',
    capacity: 100,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  };

  const samplePaidOrder: TicketOrder = {
    id: 'ord-1',
    buyerId: 'buyer-1',
    eventListingId: 'ev-1',
    occurrenceId: 'occ-1',
    status: 'paid',
    currency: 'BRL',
    subtotalMinor: 10000,
    discountMinor: 0,
    platformFeeMinor: 1000,
    paymentFeeMinor: 0,
    serviceFeeMinor: 0,
    totalMinor: 10000,
    buyerSnapshot: { name: 'João', email: 'joao@example.com' },
    eventSnapshot: {
      title: 'Festival de Verão',
      startsAt: '2026-09-10T20:00:00.000Z',
      endsAt: '2026-09-10T23:59:00.000Z',
    },
    salesPolicySnapshot: {
      cancellationPolicy: 'flexible',
      serviceFeeMode: 'pass_to_buyer',
      allowTicketTransfer: true,
      ticketTransferCutoffHours: 4,
    },
    idempotencyKey: 'idem-1',
    createdAt: '2026-06-02T10:00:00.000Z',
    paidAt: '2026-06-02T10:01:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels an occurrence, initiates refunds for paid orders, and notifies buyers', async () => {
    vi.mocked(cancelEventOccurrenceUseCase).mockResolvedValue(sampleOccurrence);
    vi.mocked(listEventOrdersForPartnerOrAdminUseCase).mockResolvedValue([samplePaidOrder]);
    const sampleRefund: Refund = {
      id: 'ref-1',
      orderId: 'ord-1',
      amountMinor: 10000,
      serviceFeeMinor: 0,
      requestedBy: 'partner',
      reason: 'Chuva intensa',
      status: 'pending_provider',
      provider: 'stripe',
      idempotencyKey: 'cancel_occ_occ-1_ord_ord-1',
      createdAt: '2026-06-03T10:00:00.000Z',
    };
    vi.mocked(processTicketRefundApplicationUseCase).mockResolvedValue({
      refund: sampleRefund,
      isReplay: false,
    });

    const result = await cancelEventOccurrenceAndRefundApplicationUseCase(
      actor,
      'occ-1',
      'Chuva intensa'
    );

    expect(result.occurrence.status).toBe('canceled');
    expect(result.refundsInitiated).toHaveLength(1);
    expect(chargeCancellationPenaltyApplicationUseCase).toHaveBeenCalledWith({
      referenceType: 'event_occurrence',
      referenceId: 'occ-1',
      sales: [{ referenceType: 'ticket_order', referenceId: 'ord-1' }],
    });
    expect(processTicketRefundApplicationUseCase).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        orderId: 'ord-1',
        isEventCanceledByOrganizer: true,
      })
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientPartnerId: 'buyer-1',
        title: 'Sessão de evento cancelada',
      })
    );
  });

  it('postpones an occurrence, moves orders when requested, and notifies buyers', async () => {
    const newOccurrence: EventOccurrence = {
      ...sampleOccurrence,
      id: 'occ-2',
      status: 'scheduled',
      startsAt: '2026-09-17T20:00:00.000Z',
      endsAt: '2026-09-17T23:59:00.000Z',
      rescheduledFromOccurrenceId: 'occ-1',
    };
    vi.mocked(postponeEventOccurrenceUseCase).mockResolvedValue({
      postponedOccurrence: {
        ...sampleOccurrence,
        status: 'postponed',
        rescheduledToOccurrenceId: 'occ-2',
      },
      newOccurrence,
    });
    vi.mocked(moveOrderToOccurrenceUseCase).mockResolvedValue({
      movedOrdersCount: 1,
      movedTicketsCount: 2,
    });
    vi.mocked(getEventListingByIdUseCase).mockResolvedValue({
      id: 'ev-1',
      title: 'Festival de Verão',
    } as EventListing);
    vi.mocked(listEventOrdersForPartnerOrAdminUseCase).mockResolvedValue([samplePaidOrder]);

    const res = await postponeEventOccurrenceAndNotifyApplicationUseCase(actor, 'occ-1', {
      startsAt: '2026-09-17T20:00:00.000Z',
      endsAt: '2026-09-17T23:59:00.000Z',
      reason: 'Mudança de palco',
      moveExistingOrders: true,
    });

    expect(res.postponedOccurrence.status).toBe('postponed');
    expect(res.newOccurrence.id).toBe('occ-2');
    expect(res.movedOrdersCount).toBe(1);
    expect(res.movedTicketsCount).toBe(2);
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientPartnerId: 'buyer-1',
        title: 'Evento reagendado',
      })
    );
  });
});
