import { stripePaymentService } from '../factory';

export async function retrievePaymentIntentUseCase(paymentIntentId: string) {
  return stripePaymentService.retrievePaymentIntent(paymentIntentId);
}
