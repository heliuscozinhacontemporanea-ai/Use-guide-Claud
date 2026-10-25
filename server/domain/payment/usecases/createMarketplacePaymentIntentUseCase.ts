import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

/** Destination charge para qualquer venda de parceiro; `referenceType`/`referenceId` vão na metadata. */
export async function createMarketplacePaymentIntentUseCase(params: {
  referenceType: string;
  referenceId: string;
  buyerId: string;
  sellerPartnerId: string;
  sellerAccountKey: string;
  description: string;
  totalMinor: number;
  platformFeeMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createMarketplacePaymentIntent(params);
}
