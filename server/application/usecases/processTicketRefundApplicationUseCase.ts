import { processProviderRefundUseCase } from '../../domain/payment';
import {
  finalizeTicketRefundStatusUseCase,
  requestTicketRefundUseCase,
  type Refund,
} from '../../domain/ticketing';
import { OrchestrationActor } from './orchestrationActor';

export async function processTicketRefundApplicationUseCase(
  actor: OrchestrationActor,
  params: {
    orderId: string;
    ticketId?: string;
    reason: string;
    idempotencyKey: string;
    isEventCanceledByOrganizer?: boolean;
  }
): Promise<{
  refund: Refund;
  isReplay: boolean;
}> {
  const { refund, isReplay, order } = await requestTicketRefundUseCase(actor, params);

  if (isReplay && refund.status === 'approved') {
    return { refund, isReplay: true };
  }

  const paymentIntentId = order.paymentIntentId || order.paymentId;
  if (!paymentIntentId || paymentIntentId === 'free_order') {
    const updated = await finalizeTicketRefundStatusUseCase(
      refund.id,
      'approved',
      'free_order_refund'
    );
    return { refund: updated, isReplay };
  }

  try {
    const providerRes = await processProviderRefundUseCase({
      paymentIntentId,
      amountMinor: refund.amountMinor,
      reverseTransfer: true,
      refundApplicationFee: Boolean(params.isEventCanceledByOrganizer),
      idempotencyKey: `stripe_ref_${refund.id}_${params.idempotencyKey}`,
      metadata: { refundId: refund.id, orderId: params.orderId, referenceType: 'ticket_refund' },
    });

    const finalStatus: Refund['status'] =
      providerRes.status === 'failed'
        ? 'failed'
        : providerRes.status === 'pending'
          ? 'pending_provider'
          : 'approved';

    const finalized = await finalizeTicketRefundStatusUseCase(
      refund.id,
      finalStatus,
      providerRes.providerRefundId || undefined
    );

    return { refund: finalized, isReplay };
  } catch (error) {
    await finalizeTicketRefundStatusUseCase(refund.id, 'failed').catch(() => undefined);
    throw error;
  }
}
