import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/events', () => ({ getEventListingByIdUseCase: vi.fn() }));
vi.mock('../../domain/notifications', () => ({ createNotificationUseCase: vi.fn() }));
vi.mock('./activatePaidPlanApplicationUseCase', () => ({
  activatePaidPlanApplicationUseCase: vi.fn(),
}));
vi.mock('../../domain/payment', () => ({
  applyPayoutRefundUseCase: vi.fn(),
  closePayoutDisputeUseCase: vi.fn(),
  holdPayoutForDisputeUseCase: vi.fn(),
  markAccountDebtPaidUseCase: vi.fn(),
  recordSalePayoutUseCase: vi.fn(),
  createPaymentForTicketOrderUseCase: vi.fn(),
  getPaymentReferenceUseCase: vi.fn().mockResolvedValue(null),
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
  hasCheckedInTicketForOrderUseCase: vi.fn(),
  markTicketOrderDisputedUseCase: vi.fn(),
  markTicketOrderPaymentFailedUseCase: vi.fn(),
  requestTicketRefundUseCase: vi.fn(),
  TicketingDomainError: class extends Error {},
}));

import {
  applyPayoutRefundUseCase,
  closePayoutDisputeUseCase,
  getPaymentReferenceUseCase,
  holdPayoutForDisputeUseCase,
  markAccountDebtPaidUseCase,
  processProviderRefundUseCase,
  recordSalePayoutUseCase,
  updatePaymentTransactionStatusUseCase,
} from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  finalizeTicketRefundStatusUseCase,
  hasCheckedInTicketForOrderUseCase,
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
      refund: {
        id: 'ref_1',
        orderId: 'ord_1',
        amountMinor: 5000,
        status: 'pending_provider',
      } as Refund,
      isReplay: false,
      order: { id: 'ord_1', paymentIntentId: 'pi_1' } as TicketOrder,
    });
    vi.mocked(processProviderRefundUseCase).mockResolvedValue({
      providerRefundId: 're_stripe_1',
      status: 'pending',
    });
    vi.mocked(finalizeTicketRefundStatusUseCase).mockResolvedValue({
      id: 'ref_1',
      status: 'pending_provider',
    } as Refund);

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

  it('refund.updated com status succeeded aprova o reembolso e desconta o repasse', async () => {
    vi.mocked(finalizeTicketRefundStatusUseCase).mockResolvedValue({
      id: 'ref_1',
      orderId: 'ord_1',
      amountMinor: 5300,
      serviceFeeMinor: 300,
      status: 'approved',
    } as Refund);
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_2',
      type: 'refund.updated',
      created: 1,
      dataObject: { id: 're_1', status: 'succeeded', metadata: { refundId: 'ref_1' } },
    });
    expect(finalizeTicketRefundStatusUseCase).toHaveBeenCalledWith('ref_1', 'approved', 're_1');
    expect(applyPayoutRefundUseCase).toHaveBeenCalledWith({
      referenceType: 'ticket_order',
      referenceId: 'ord_1',
      refundKey: 'ref_1',
      amountMinor: 5300,
      serviceFeeMinor: 300,
    });
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

describe('ticketingPaymentOrchestrationUseCases — repasse (D14)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pagamento confirmado registra o repasse com a conta do CNPJ e a cobrança de origem', async () => {
    vi.mocked(confirmTicketOrderPaymentUseCase).mockResolvedValue({
      order: {
        id: 'ord_1',
        totalMinor: 10600,
        serviceFeeMinor: 600,
        platformFeeMinor: 1000,
        eventSnapshot: {
          title: 'Show',
          startsAt: '2026-12-20T22:00:00.000Z',
          endsAt: '2026-12-21T03:00:00.000Z',
        },
      } as TicketOrder,
      tickets: [],
      alreadyPaid: true,
    });
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_pi',
      type: 'payment_intent.succeeded',
      created: 1,
      dataObject: {
        id: 'pi_1',
        latest_charge: 'ch_1',
        metadata: { referenceType: 'ticket_order', referenceId: 'ord_1', accountKey: 'key-1' },
      },
    });
    expect(recordSalePayoutUseCase).toHaveBeenCalledWith({
      referenceType: 'ticket_order',
      referenceId: 'ord_1',
      accountKey: 'key-1',
      paymentIntentId: 'pi_1',
      chargeId: 'ch_1',
      grossMinor: 10600,
      serviceFeeMinor: 600,
      platformFeeMinor: 1000,
      serviceEndsAt: '2026-12-21T03:00:00.000Z',
    });
  });

  it('pagamento de dívida do parceiro quita a dívida, sem tocar em pedido (D16)', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_debt',
      type: 'payment_intent.succeeded',
      created: 1,
      dataObject: {
        id: 'pi_debt',
        metadata: { referenceType: 'account_debt', referenceId: 'debt_x' },
      },
    });
    expect(markAccountDebtPaidUseCase).toHaveBeenCalledWith('debt_x', 'pi_debt');
    expect(confirmTicketOrderPaymentUseCase).not.toHaveBeenCalled();
  });

  it('contestação perdida: com check-in a plataforma arca, sem check-in o CNPJ paga (D16)', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'ticket_order',
      referenceId: 'ord_1',
    } as never);
    for (const [checkedIn, outcome] of [
      [true, 'lost_platform_absorbs'],
      [false, 'lost_partner_pays'],
    ] as const) {
      vi.mocked(hasCheckedInTicketForOrderUseCase).mockResolvedValue(checkedIn);
      await reconcileStripeWebhookEventApplicationUseCase({
        id: `evt_lost_${checkedIn}`,
        type: 'charge.dispute.closed',
        created: 1,
        dataObject: { payment_intent: 'pi_1', status: 'lost' },
      });
      expect(closePayoutDisputeUseCase).toHaveBeenLastCalledWith('pi_1', outcome);
    }
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue(null);
  });

  it('contestação segura o repasse; encerrada ganha ou perdida avisa o repasse', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_d1',
      type: 'charge.dispute.created',
      created: 1,
      dataObject: { payment_intent: 'pi_1', metadata: {} },
    });
    expect(holdPayoutForDisputeUseCase).toHaveBeenCalledWith('pi_1');
    for (const [status, won] of [
      ['won', 'won'],
      ['warning_closed', 'won'],
      ['lost', 'lost_partner_pays'],
    ] as const) {
      await reconcileStripeWebhookEventApplicationUseCase({
        id: `evt_${status}`,
        type: 'charge.dispute.closed',
        created: 1,
        dataObject: { payment_intent: 'pi_1', status },
      });
      expect(closePayoutDisputeUseCase).toHaveBeenLastCalledWith('pi_1', won);
    }
  });
});
