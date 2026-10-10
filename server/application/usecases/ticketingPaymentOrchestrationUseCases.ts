import { getEventListingByIdUseCase } from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  createPaymentForTicketOrderUseCase,
  PaymentDomainError,
  processProviderRefundUseCase,
  retrievePaymentIntentUseCase,
  syncConnectedAccountFromWebhookUseCase,
  updatePaymentTransactionStatusUseCase,
  type VerifiedWebhookEvent,
} from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  finalizeTicketRefundStatusUseCase,
  getTicketOrderUseCase,
  markTicketOrderDisputedUseCase,
  markTicketOrderPaymentFailedUseCase,
  requestTicketRefundUseCase,
  TicketingDomainError,
  type Refund,
  type Ticket,
  type TicketOrder,
} from '../../domain/ticketing';
import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';

export interface OrchestrationActor {
  uid: string;
  admin?: boolean;
  role?: string;
}

export async function createTicketOrderPaymentIntentApplicationUseCase(
  actor: OrchestrationActor,
  input: {
    orderId: string;
    idempotencyKey: string;
  }
): Promise<{
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  orderStatus: TicketOrder['status'];
}> {
  const { order } = await getTicketOrderUseCase(actor, input.orderId);
  if (order.buyerId !== actor.uid && actor.admin !== true) {
    throw new TicketingDomainError('FORBIDDEN', 'Acesso negado a este pedido.');
  }

  if (order.status === 'paid') {
    return {
      orderId: order.id,
      paymentIntentId: order.paymentIntentId || order.paymentId || '',
      clientSecret: '',
      status: 'succeeded',
      orderStatus: 'paid',
    };
  }

  if (order.status === 'expired' || order.status === 'canceled') {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      `Este pedido não pode ser pago porque está com status "${order.status}".`
    );
  }

  if (order.expiresAt && new Date(order.expiresAt).getTime() <= Date.now()) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      'O prazo de reserva deste pedido expirou.'
    );
  }

  if (order.totalMinor <= 0) {
    const confirmed = await confirmTicketOrderPaymentUseCase({
      orderId: order.id,
      paymentId: 'free_order',
    });
    return {
      orderId: confirmed.order.id,
      paymentIntentId: 'free_order',
      clientSecret: '',
      status: 'succeeded',
      orderStatus: confirmed.order.status,
    };
  }

  const listing = await getEventListingByIdUseCase(order.eventListingId);
  if (!listing) {
    throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
  }

  const partnerId = listing.partnerId || listing.ownerId;

  const paymentResult = await createPaymentForTicketOrderUseCase({
    orderId: order.id,
    buyerId: order.buyerId,
    sellerPartnerId: partnerId,
    eventListingId: order.eventListingId,
    occurrenceId: order.occurrenceId,
    eventTitle: order.eventSnapshot?.title || listing.title,
    totalMinor: order.totalMinor,
    platformFeeMinor: order.platformFeeMinor,
    idempotencyKey: input.idempotencyKey,
  });

  return {
    orderId: order.id,
    paymentIntentId: paymentResult.paymentIntentId,
    clientSecret: paymentResult.clientSecret,
    status: paymentResult.status,
    orderStatus: order.status,
  };
}

export async function confirmTicketOrderPaymentClientReturnApplicationUseCase(
  actor: OrchestrationActor,
  params: {
    orderId: string;
    paymentIntentId: string;
  }
): Promise<{
  order: TicketOrder;
  tickets: Ticket[];
}> {
  const { order } = await getTicketOrderUseCase(actor, params.orderId);
  if (order.buyerId !== actor.uid && actor.admin !== true) {
    throw new TicketingDomainError('FORBIDDEN', 'Acesso negado a este pedido.');
  }

  if (order.status === 'paid') {
    const fresh = await getTicketOrderUseCase(actor, order.id);
    return {
      order: fresh.order,
      tickets: fresh.tickets,
    };
  }

  const pi = await retrievePaymentIntentUseCase(params.paymentIntentId);
  if (pi.metadata?.orderId && pi.metadata.orderId !== order.id) {
    throw new PaymentDomainError(
      'FORBIDDEN',
      'PaymentIntent não pertence ao pedido informado.'
    );
  }

  if (pi.status === 'succeeded') {
    await updatePaymentTransactionStatusUseCase(pi.id, 'succeeded');
    const confirmed = await confirmTicketOrderPaymentUseCase({
      orderId: order.id,
      paymentId: pi.id,
      paymentIntentId: pi.id,
    });
    return {
      order: confirmed.order,
      tickets: confirmed.tickets,
    };
  }

  if (pi.status === 'Canceled' || pi.status === 'canceled') {
    await updatePaymentTransactionStatusUseCase(pi.id, 'canceled');
    await markTicketOrderPaymentFailedUseCase({
      orderId: order.id,
      paymentIntentId: pi.id,
    });
  }

  const current = await getTicketOrderUseCase(actor, order.id);
  return {
    order: current.order,
    tickets: current.tickets,
  };
}

export async function reconcileStripeWebhookEventApplicationUseCase(
  event: VerifiedWebhookEvent
): Promise<{ processed: boolean; eventType: string }> {
  const obj = event.dataObject || {};

  if (event.type === 'account.updated') {
    const stripeAccountId = String(obj.id || event.account || '');
    if (stripeAccountId) {
      await syncConnectedAccountFromWebhookUseCase(stripeAccountId);
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntentId = String(obj.id || '');
    const metadata = (obj.metadata as Record<string, string> | undefined) || {};
    await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');

    if (
      (metadata.type === 'ticket_order' ||
        metadata.referenceType === 'ticket_order') &&
      (metadata.orderId || metadata.referenceId)
    ) {
      const orderId = metadata.orderId || metadata.referenceId || '';
      const confirmed = await confirmTicketOrderPaymentUseCase({
        orderId,
        paymentId: paymentIntentId,
        paymentIntentId,
      });

      const targetPartnerId = metadata.partnerId || metadata.sellerPartnerId;
      if (!confirmed.alreadyPaid && targetPartnerId) {
        await createNotificationUseCase({
          recipientPartnerId: targetPartnerId,
          type: 'admin_message',
          title: 'Nova venda de ingresso confirmada!',
          message: `Pedido #${confirmed.order.id.slice(0, 8)} confirmado via Stripe (${confirmed.tickets.length} ingresso(s)).`,
        }).catch(() => undefined);
      }
    } else if (
      metadata.referenceType === 'plan_payment' &&
      metadata.partnerId &&
      metadata.planId
    ) {
      await activatePaidPlanApplicationUseCase({
        partnerId: metadata.partnerId,
        planId: metadata.planId,
        paymentReference: paymentIntentId,
      });
    }

    return { processed: true, eventType: event.type };
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntentId = String(obj.id || '');
    const metadata = (obj.metadata as Record<string, string> | undefined) || {};
    await updatePaymentTransactionStatusUseCase(paymentIntentId, 'failed');

    const orderId = metadata.orderId || metadata.referenceId;
    if (
      (metadata.type === 'ticket_order' ||
        metadata.referenceType === 'ticket_order') &&
      orderId
    ) {
      await markTicketOrderPaymentFailedUseCase({
        orderId,
        paymentId: paymentIntentId,
        paymentIntentId,
      });
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'refund.updated' || event.type === 'refund.created') {
    const refundMetadata = (obj.metadata as Record<string, string> | undefined) || {};
    const providerStatus = String(obj.status || '');
    if (refundMetadata.refundId) {
      if (providerStatus === 'succeeded') {
        await finalizeTicketRefundStatusUseCase(refundMetadata.refundId, 'approved', String(obj.id || ''));
      } else if (providerStatus === 'failed' || providerStatus === 'canceled') {
        await finalizeTicketRefundStatusUseCase(refundMetadata.refundId, 'failed', String(obj.id || ''));
      }
      // 'pending' e 'requires_action' permanecem como pending_provider até o próximo refund.updated.
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'charge.refunded') {
    const paymentIntentId = String(obj.payment_intent || '');
    if (paymentIntentId && obj.refunded === true) {
      await updatePaymentTransactionStatusUseCase(paymentIntentId, 'refunded');
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'charge.dispute.created') {
    const paymentIntentId = String(obj.payment_intent || '');
    const metadata = (obj.metadata as Record<string, string> | undefined) || {};
    if (paymentIntentId) {
      await updatePaymentTransactionStatusUseCase(paymentIntentId, 'disputed');
    }
    const orderId = metadata.orderId || metadata.referenceId;
    if (orderId) {
      await markTicketOrderDisputedUseCase({
        orderId,
        paymentId: paymentIntentId,
        paymentIntentId,
      });
    }
    return { processed: true, eventType: event.type };
  }

  return { processed: true, eventType: event.type };
}

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
  const { refund, isReplay, order } = await requestTicketRefundUseCase(
    actor,
    params
  );

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
    await finalizeTicketRefundStatusUseCase(refund.id, 'failed').catch(
      () => undefined
    );
    throw error;
  }
}
