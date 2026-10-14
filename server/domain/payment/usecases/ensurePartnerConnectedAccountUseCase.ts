import { stripePaymentService } from '../factory';
import type { StripeConnectedAccountRecord } from '../ports/marketplaceAccountPort';

export async function ensurePartnerConnectedAccountUseCase(params: {
  partnerId: string;
  email: string;
}): Promise<StripeConnectedAccountRecord> {
  return stripePaymentService.ensureConnectedAccount(params);
}
