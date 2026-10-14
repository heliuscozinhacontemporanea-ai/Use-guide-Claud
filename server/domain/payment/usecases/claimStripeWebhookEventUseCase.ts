import { stripePaymentService } from '../factory';
import type { WebhookEventClaimResult } from '../ports/transactionRepositoryPort';

export async function claimStripeWebhookEventUseCase(params: {
  eventId: string;
  eventType: string;
}): Promise<WebhookEventClaimResult> {
  return stripePaymentService.claimWebhookEvent(params);
}
