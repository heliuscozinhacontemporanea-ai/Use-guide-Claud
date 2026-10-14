import { stripePaymentService } from '../factory';

export async function completeStripeWebhookEventUseCase(eventId: string): Promise<void> {
  return stripePaymentService.completeWebhookEvent(eventId);
}
