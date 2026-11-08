import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

export async function createPaymentForTicketOrderUseCase(params: {
  orderId: string;
  buyerId: string;
  sellerPartnerId: string;
  sellerAccountKey: string;
  eventListingId: string;
  occurrenceId: string;
  eventTitle: string;
  serviceStartsAt: string;
  totalMinor: number;
  platformFeeMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createTicketOrderPaymentIntent(params);
}
