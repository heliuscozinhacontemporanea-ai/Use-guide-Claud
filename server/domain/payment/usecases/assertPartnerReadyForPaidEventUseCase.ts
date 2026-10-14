import { stripePaymentService } from '../factory';
import type { StripeConnectedAccountRecord } from '../ports/marketplaceAccountPort';

export async function assertPartnerReadyForPaidEventUseCase(
  partnerId: string
): Promise<StripeConnectedAccountRecord> {
  return stripePaymentService.assertPartnerReadyForPaidEvent(partnerId);
}
