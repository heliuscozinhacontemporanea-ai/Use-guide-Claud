import { stripePaymentService } from '../factory';

export async function syncConnectedAccountFromWebhookUseCase(
  stripeAccountId: string
): Promise<void> {
  return stripePaymentService.syncConnectedAccountFromWebhook(stripeAccountId);
}
