import { paymentAccountService } from '../factory';

export function syncPaymentAccountFromWebhookUseCase(stripeAccountId: string): Promise<void> {
  return paymentAccountService.syncFromWebhook(stripeAccountId);
}
