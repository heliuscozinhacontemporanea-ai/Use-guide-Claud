import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

/**
 * Cobrança na plataforma para qualquer venda de parceiro (D14); `referenceType`/`referenceId` vão na metadata.
 * `serviceStartsAt` decide se o Pix é oferecido.
 */
export async function createMarketplacePaymentIntentUseCase(params: {
  referenceType: string;
  referenceId: string;
  buyerId: string;
  sellerPartnerId: string;
  sellerAccountKey: string;
  description: string;
  serviceStartsAt: string;
  totalMinor: number;
  platformFeeMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createMarketplacePaymentIntent(params);
}
