import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

export async function createPlanPaymentIntentUseCase(params: {
  buyerId: string;
  planId: string;
  planName: string;
  amountMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createPlanPaymentIntent(params);
}
