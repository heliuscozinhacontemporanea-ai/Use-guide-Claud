import { stripePaymentService } from '../factory';
import type { ConnectedAccountStatus } from '../ports/marketplaceAccountPort';

export async function getPartnerConnectAccountStatusUseCase(partnerId: string): Promise<{
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: ConnectedAccountStatus['status'];
}> {
  return stripePaymentService.getPartnerAccountStatus(partnerId);
}
