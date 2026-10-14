import { stripePaymentService } from '../factory';
import type { VerifiedWebhookEvent } from '../ports/paymentGatewayPort';

export function constructStripeWebhookEventUseCase(
  payload: string | Buffer,
  signature: string
): VerifiedWebhookEvent {
  return stripePaymentService.constructWebhookEvent(payload, signature);
}
