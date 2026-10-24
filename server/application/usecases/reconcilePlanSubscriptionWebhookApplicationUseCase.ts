import { createNotificationUseCase } from '../../domain/notifications';
import { syncPlanSubscriptionUseCase, type VerifiedWebhookEvent } from '../../domain/payment';
import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';

export const PLAN_SUBSCRIPTION_WEBHOOK_EVENTS: ReadonlySet<string> = new Set([
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

/** Assinatura que gerou a fatura (API 2025-03-31+: `invoice.parent.subscription_details`). */
export function readInvoiceSubscriptionId(invoice: Record<string, unknown>): string | null {
  const parent = invoice.parent as { subscription_details?: { subscription?: unknown } } | null;
  const subscription = parent?.subscription_details?.subscription;
  if (typeof subscription === 'string') return subscription;
  if (subscription && typeof subscription === 'object' && 'id' in subscription) {
    return String((subscription as { id: unknown }).id);
  }
  return null;
}

export async function reconcilePlanSubscriptionWebhookApplicationUseCase(
  event: VerifiedWebhookEvent
): Promise<void> {
  const obj = event.dataObject || {};

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscriptionId = String(obj.id || '');
    if (subscriptionId) {
      await syncPlanSubscriptionUseCase(subscriptionId);
    }
    return;
  }

  const subscriptionId = readInvoiceSubscriptionId(obj);
  if (!subscriptionId) return;

  // Os eventos podem chegar fora de ordem: relemos a assinatura em vez de confiar no payload.
  const snapshot = await syncPlanSubscriptionUseCase(subscriptionId);
  const { referenceType, partnerId, planId, itemId } = snapshot.metadata;
  if (referenceType !== 'plan_subscription' || !partnerId || !planId || !itemId) return;

  if (event.type === 'invoice.paid') {
    await activatePaidPlanApplicationUseCase({
      itemId,
      partnerId,
      planId,
      paymentReference: String(obj.id || ''),
      subscriptionPeriodEnd: snapshot.currentPeriodEnd,
    });
    return;
  }

  // TODO: notifications ainda não aceita chave i18n (AGENTS.md §12.5); texto em pt-BR por enquanto.
  await createNotificationUseCase({
    recipientPartnerId: partnerId,
    type: 'admin_message',
    title: 'Falha na renovação do plano',
    message: 'Não conseguimos cobrar seu cartão. Atualize a forma de pagamento para manter o selo.',
  }).catch(() => undefined);
}
