import { stripePaymentService } from '../factory';

export async function releaseStripeWebhookEventUseCase(
  eventId: string,
  errorMessage: string
): Promise<void> {
  return stripePaymentService.releaseWebhookEvent(eventId, errorMessage);
}
