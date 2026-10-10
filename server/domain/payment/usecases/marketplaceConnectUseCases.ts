import { stripePaymentService } from '../factory';
import type {
  ConnectedAccountStatus,
  StripeConnectedAccountRecord,
} from '../ports/marketplaceAccountPort';

export async function ensurePartnerConnectedAccountUseCase(params: {
  partnerId: string;
  email: string;
}): Promise<StripeConnectedAccountRecord> {
  return stripePaymentService.ensureConnectedAccount(params);
}

export async function createPartnerConnectAccountSessionUseCase(params: {
  partnerId: string;
  email: string;
}): Promise<{ clientSecret: string }> {
  return stripePaymentService.createAccountSession(params);
}

export async function getPartnerConnectAccountStatusUseCase(
  partnerId: string
): Promise<{
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: ConnectedAccountStatus['status'];
}> {
  return stripePaymentService.getPartnerAccountStatus(partnerId);
}

export async function assertPartnerReadyForPaidEventUseCase(
  partnerId: string
): Promise<StripeConnectedAccountRecord> {
  return stripePaymentService.assertPartnerReadyForPaidEvent(partnerId);
}

export async function syncConnectedAccountFromWebhookUseCase(
  stripeAccountId: string
): Promise<void> {
  return stripePaymentService.syncConnectedAccountFromWebhook(stripeAccountId);
}
