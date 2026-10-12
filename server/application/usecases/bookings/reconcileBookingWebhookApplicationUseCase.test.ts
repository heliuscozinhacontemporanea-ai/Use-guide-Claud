import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
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
import { getPaymentReferenceUseCase, processProviderRefundUseCase } from '../../../domain/payment';
import { reconcileBookingWebhookApplicationUseCase } from './reconcileBookingWebhookApplicationUseCase';

function event(type: string, dataObject: Record<string, unknown>) {
  return { id: 'evt_1', type, created: 0, dataObject };
}

const SUCCEEDED = event('payment_intent.succeeded', {
  id: 'pi_1',
  metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1' },
});

describe('reconcileBookingWebhookApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pagamento aprovado confirma a reserva e avisa o parceiro', async () => {
    vi.mocked(confirmBookingPaymentUseCase).mockResolvedValue({
      sellerPartnerId: 'p1',
      participantsCount: 2,
      offerSnapshot: { title: 'Passeio' },
    } as never);
    await expect(reconcileBookingWebhookApplicationUseCase(SUCCEEDED)).resolves.toBe(true);
    expect(confirmBookingPaymentUseCase).toHaveBeenCalledWith('bk_1', 'pi_1');
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
        refundApplicationFee: true,
        reverseTransfer: true,
        idempotencyKey: 'refund_late_bk_1',
      })
    );
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

  it('reembolso aprovado marca só reserva cancelada', async () => {
    const succeeded = event('refund.updated', {
      status: 'succeeded',
      metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
    });
    vi.mocked(getBookingUseCase).mockResolvedValueOnce({ status: 'canceled' } as never);
    await reconcileBookingWebhookApplicationUseCase(succeeded);
    expect(markBookingRefundedUseCase).toHaveBeenCalledWith('bk_1');
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
