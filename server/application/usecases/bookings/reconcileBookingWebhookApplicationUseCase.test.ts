import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    requiresServiceProof: (await import('../../../domain/bookings/utils/serviceProof'))
      .requiresServiceProof,
    bookingServiceEndsAt: (await import('../../../domain/bookings/utils/serviceTime'))
      .bookingServiceEndsAt,
    BookingDomainError,
    confirmBookingPaymentUseCase: vi.fn(),
    getBookingUseCase: vi.fn(),
    markBookingDisputedUseCase: vi.fn().mockResolvedValue({}),
    markBookingPaymentFailedUseCase: vi.fn().mockResolvedValue(undefined),
    markBookingRefundedUseCase: vi.fn().mockResolvedValue({}),
  };
});
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../domain/payment', () => ({
  applyPayoutRefundUseCase: vi.fn().mockResolvedValue(null),
  recordSalePayoutUseCase: vi.fn().mockResolvedValue({}),
  getPaymentReferenceUseCase: vi.fn(),
  processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
  updatePaymentTransactionStatusUseCase: vi.fn().mockResolvedValue(undefined),
}));

import {
  BookingDomainError,
  confirmBookingPaymentUseCase,
  getBookingUseCase,
  markBookingDisputedUseCase,
  markBookingRefundedUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  applyPayoutRefundUseCase,
  getPaymentReferenceUseCase,
  processProviderRefundUseCase,
  recordSalePayoutUseCase,
} from '../../../domain/payment';
import { reconcileBookingWebhookApplicationUseCase } from './reconcileBookingWebhookApplicationUseCase';

function event(type: string, dataObject: Record<string, unknown>) {
  return { id: 'evt_1', type, created: 0, dataObject };
}

const SUCCEEDED = event('payment_intent.succeeded', {
  id: 'pi_1',
  latest_charge: 'ch_1',
  metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1', accountKey: 'key-1' },
});

describe('reconcileBookingWebhookApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pagamento aprovado confirma a reserva, registra o repasse e avisa o parceiro', async () => {
    vi.mocked(confirmBookingPaymentUseCase).mockResolvedValue({
      id: 'bk_1',
      sellerPartnerId: 'p1',
      kind: 'tour',
      participantsCount: 2,
      totalMinor: 30000,
      platformFeeMinor: 4500,
      offerSnapshot: {
        title: 'Passeio',
        startsAt: '2026-11-10T12:00:00.000Z',
        durationMinutes: 240,
      },
    } as never);
    await expect(reconcileBookingWebhookApplicationUseCase(SUCCEEDED)).resolves.toBe(true);
    expect(confirmBookingPaymentUseCase).toHaveBeenCalledWith('bk_1', 'pi_1');
    expect(recordSalePayoutUseCase).toHaveBeenCalledWith({
      referenceType: 'booking',
      referenceId: 'bk_1',
      accountKey: 'key-1',
      paymentIntentId: 'pi_1',
      chargeId: 'ch_1',
      grossMinor: 30000,
      serviceFeeMinor: 0,
      platformFeeMinor: 4500,
      serviceEndsAt: '2026-11-10T16:00:00.000Z',
      title: 'Passeio',
      // D20: o repasse do passeio nasce retido até a prova do serviço.
      holdReasons: ['service_proof'],
    });
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientPartnerId: 'p1' })
    );
  });

  it('pagamento tardio sem vaga é reembolsado por inteiro', async () => {
    vi.mocked(confirmBookingPaymentUseCase).mockRejectedValue(
      new BookingDomainError('LATE_PAYMENT_REJECTED', 'x')
    );
    await reconcileBookingWebhookApplicationUseCase(SUCCEEDED);
    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: 'pi_1',
        idempotencyKey: 'refund_late_bk_1',
      })
    );
    expect(recordSalePayoutUseCase).not.toHaveBeenCalled();
  });

  it('erro inesperado sobe para o webhook responder 5xx', async () => {
    vi.mocked(confirmBookingPaymentUseCase).mockRejectedValue(new Error('firestore down'));
    await expect(reconcileBookingWebhookApplicationUseCase(SUCCEEDED)).rejects.toThrow(
      'firestore down'
    );
  });

  it('reembolso pendente não marca a reserva como reembolsada', async () => {
    const pending = event('refund.updated', {
      status: 'pending',
      metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
    });
    await expect(reconcileBookingWebhookApplicationUseCase(pending)).resolves.toBe(true);
    expect(markBookingRefundedUseCase).not.toHaveBeenCalled();
  });

  it('reembolso aprovado desconta o repasse e marca só reserva cancelada', async () => {
    const succeeded = event('refund.updated', {
      id: 're_1',
      amount: 15000,
      status: 'succeeded',
      metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
    });
    vi.mocked(getBookingUseCase).mockResolvedValueOnce({ status: 'canceled' } as never);
    await reconcileBookingWebhookApplicationUseCase(succeeded);
    expect(markBookingRefundedUseCase).toHaveBeenCalledWith('bk_1');
    expect(applyPayoutRefundUseCase).toHaveBeenCalledWith({
      referenceType: 'booking',
      referenceId: 'bk_1',
      refundKey: 're_1',
      amountMinor: 15000,
      serviceFeeMinor: 0,
    });
    vi.mocked(getBookingUseCase).mockResolvedValueOnce({ status: 'expired' } as never);
    await reconcileBookingWebhookApplicationUseCase(succeeded);
    expect(markBookingRefundedUseCase).toHaveBeenCalledTimes(1);
  });

  it('disputa usa a referência gravada na transação', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'booking',
      referenceId: 'bk_1',
    });
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('charge.dispute.created', { payment_intent: 'pi_1' })
      )
    ).resolves.toBe(true);
    expect(markBookingDisputedUseCase).toHaveBeenCalledWith('bk_1');
  });

  it('eventos que não são de reserva seguem para o fluxo de ingressos', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'ticket_order',
      referenceId: 'o1',
    });
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('payment_intent.succeeded', {
          id: 'pi_2',
          metadata: { referenceType: 'ticket_order' },
        })
      )
    ).resolves.toBe(false);
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('charge.dispute.created', { payment_intent: 'pi_2' })
      )
    ).resolves.toBe(false);
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('refund.updated', { metadata: { refundId: 'r1' } })
      )
    ).resolves.toBe(false);
  });
});
