import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/events', () => ({ getEventListingByIdUseCase: vi.fn() }));
vi.mock('../../domain/notifications', () => ({ createNotificationUseCase: vi.fn() }));
vi.mock('./activatePaidPlanApplicationUseCase', () => ({
  activatePaidPlanApplicationUseCase: vi.fn(),
}));
vi.mock('../../domain/payment', () => ({
  createPaymentForTicketOrderUseCase: vi.fn(),
  PaymentDomainError: class extends Error {},
  processProviderRefundUseCase: vi.fn(),
  retrievePaymentIntentUseCase: vi.fn(),
  syncConnectedAccountFromWebhookUseCase: vi.fn(),
  updatePaymentTransactionStatusUseCase: vi.fn(),
}));
vi.mock('../../domain/ticketing', () => ({
  confirmTicketOrderPaymentUseCase: vi.fn(),
  finalizeTicketRefundStatusUseCase: vi.fn(),
  getTicketOrderUseCase: vi.fn(),
  markTicketOrderDisputedUseCase: vi.fn(),
  markTicketOrderPaymentFailedUseCase: vi.fn(),
  requestTicketRefundUseCase: vi.fn(),
  TicketingDomainError: class extends Error {},
}));

import {
  processProviderRefundUseCase,
  updatePaymentTransactionStatusUseCase,
} from '../../domain/payment';
import {
  finalizeTicketRefundStatusUseCase,
  requestTicketRefundUseCase,
  type Refund,
  type TicketOrder,
} from '../../domain/ticketing';
import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';
import { reconcileStripeWebhookEventApplicationUseCase } from './reconcileStripeWebhookEventApplicationUseCase';

describe('ticketingPaymentOrchestrationUseCases — refunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('repassa metadata.refundId e orderId ao provedor ao criar reembolso', async () => {
    vi.mocked(requestTicketRefundUseCase).mockResolvedValue({
      refund: { id: 'ref_1', orderId: 'ord_1', amountMinor: 5000, status: 'pending_provider' } as Refund,
      isReplay: false,
      order: { id: 'ord_1', paymentIntentId: 'pi_1' } as TicketOrder,
    });
    vi.mocked(processProviderRefundUseCase).mockResolvedValue({
      providerRefundId: 're_stripe_1',
      status: 'pending',
    });
    vi.mocked(finalizeTicketRefundStatusUseCase).mockResolvedValue({ id: 'ref_1', status: 'pending_provider' } as Refund);

    await processTicketRefundApplicationUseCase(
      { uid: 'u1' },
      { orderId: 'ord_1', reason: 'desistencia', idempotencyKey: 'idem_1' }
    );

    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: 'pi_1',
        amountMinor: 5000,
        metadata: { refundId: 'ref_1', orderId: 'ord_1', referenceType: 'ticket_refund' },
      })
    );
  });

  it('refund.updated com status pending não chama finalizeTicketRefundStatusUseCase', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_1',
      type: 'refund.updated',
      created: 1,
      dataObject: { id: 're_1', status: 'pending', metadata: { refundId: 'ref_1' } },
    });
    expect(finalizeTicketRefundStatusUseCase).not.toHaveBeenCalled();
  });

  it('refund.updated com status succeeded aprova o reembolso', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_2',
      type: 'refund.updated',
      created: 1,
      dataObject: { id: 're_1', status: 'succeeded', metadata: { refundId: 'ref_1' } },
    });
    expect(finalizeTicketRefundStatusUseCase).toHaveBeenCalledWith('ref_1', 'approved', 're_1');
  });

  it('refund.updated com status failed marca como failed', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_3',
      type: 'refund.updated',
      created: 1,
      dataObject: { id: 're_1', status: 'failed', metadata: { refundId: 'ref_1' } },
    });
    expect(finalizeTicketRefundStatusUseCase).toHaveBeenCalledWith('ref_1', 'failed', 're_1');
  });

  it('charge.refunded com refunded=true atualiza transação para refunded', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_4',
      type: 'charge.refunded',
      created: 1,
      dataObject: {
        id: 'ch_1',
        payment_intent: 'pi_1',
        refunded: true,
      },
    });
    expect(updatePaymentTransactionStatusUseCase).toHaveBeenCalledWith('pi_1', 'refunded');
  });
});
