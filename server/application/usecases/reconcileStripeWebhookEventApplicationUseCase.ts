import { createNotificationUseCase } from '../../domain/notifications';
import {
  closePayoutDisputeUseCase,
  holdPayoutForDisputeUseCase,
  syncPaymentAccountFromWebhookUseCase,
  updatePaymentTransactionStatusUseCase,
  type VerifiedWebhookEvent,
} from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  finalizeTicketRefundStatusUseCase,
  markTicketOrderDisputedUseCase,
  markTicketOrderPaymentFailedUseCase,
} from '../../domain/ticketing';
import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
import { reconcileBookingWebhookApplicationUseCase } from './bookings/reconcileBookingWebhookApplicationUseCase';
import { applyTicketRefundToPayoutApplicationUseCase } from './payouts/applyTicketRefundToPayoutApplicationUseCase';
import { recordPaidSalePayoutApplicationUseCase } from './payouts/recordPaidSalePayoutApplicationUseCase';
import {
  PLAN_SUBSCRIPTION_WEBHOOK_EVENTS,
  reconcilePlanSubscriptionWebhookApplicationUseCase,
} from './reconcilePlanSubscriptionWebhookApplicationUseCase';

export async function reconcileStripeWebhookEventApplicationUseCase(
  event: VerifiedWebhookEvent
): Promise<{ processed: boolean; eventType: string }> {
  const obj = event.dataObject || {};

  // Contestação segura o repasse de qualquer venda, antes do tratamento de cada produto (D14).
  if (event.type === 'charge.dispute.created' && obj.payment_intent) {
    await holdPayoutForDisputeUseCase(String(obj.payment_intent));
  }
  if (event.type === 'charge.dispute.closed') {
    if (obj.payment_intent) {
      // `warning_closed`: consulta encerrada sem estorno, o dinheiro fica com a plataforma.
      const won = obj.status === 'won' || obj.status === 'warning_closed';
      await closePayoutDisputeUseCase(String(obj.payment_intent), won);
    }
    return { processed: true, eventType: event.type };
  }

  if (await reconcileBookingWebhookApplicationUseCase(event)) {
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'account.updated') {
    const stripeAccountId = String(obj.id || event.account || '');
    if (stripeAccountId) {
      await syncPaymentAccountFromWebhookUseCase(stripeAccountId);
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntentId = String(obj.id || '');
    const metadata = (obj.metadata as Record<string, string> | undefined) || {};
    await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');

    if (
      (metadata.type === 'ticket_order' || metadata.referenceType === 'ticket_order') &&
      (metadata.orderId || metadata.referenceId)
    ) {
      const orderId = metadata.orderId || metadata.referenceId || '';
      const confirmed = await confirmTicketOrderPaymentUseCase({
        orderId,
        paymentId: paymentIntentId,
        paymentIntentId,
      });
      const { order } = confirmed;
      await recordPaidSalePayoutApplicationUseCase(obj, {
        referenceType: 'ticket_order',
        referenceId: order.id,
        grossMinor: order.totalMinor,
        serviceFeeMinor: order.serviceFeeMinor,
        platformFeeMinor: order.platformFeeMinor,
        serviceEndsAt: order.eventSnapshot?.endsAt || order.eventSnapshot?.startsAt || '',
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
      metadata.planId &&
      metadata.itemId
    ) {
      await activatePaidPlanApplicationUseCase({
        itemId: metadata.itemId,
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
      (metadata.type === 'ticket_order' || metadata.referenceType === 'ticket_order') &&
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
        const refund = await finalizeTicketRefundStatusUseCase(
          refundMetadata.refundId,
          'approved',
          String(obj.id || '')
        );
        await applyTicketRefundToPayoutApplicationUseCase(refund);
      } else if (providerStatus === 'failed' || providerStatus === 'canceled') {
        await finalizeTicketRefundStatusUseCase(
          refundMetadata.refundId,
          'failed',
          String(obj.id || '')
        );
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

  if (PLAN_SUBSCRIPTION_WEBHOOK_EVENTS.has(event.type)) {
    await reconcilePlanSubscriptionWebhookApplicationUseCase(event);
    return { processed: true, eventType: event.type };
  }

  return { processed: true, eventType: event.type };
}
