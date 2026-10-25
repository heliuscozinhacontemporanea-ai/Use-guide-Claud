import { stripePaymentService } from '../factory';
import type { RefundPaymentResult } from '../ports/paymentGatewayPort';

export async function processProviderRefundUseCase(params: {
  paymentIntentId: string;
  amountMinor?: number;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}): Promise<RefundPaymentResult> {
  return stripePaymentService.refundPayment(params);
}
