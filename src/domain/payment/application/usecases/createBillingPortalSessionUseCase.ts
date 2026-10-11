import { paymentApiAdapter } from '../../factory';
import type { PaymentLocale } from '../../types/payment';

export async function createBillingPortalSessionUseCase(
  locale: PaymentLocale
): Promise<{ url: string }> {
  return paymentApiAdapter.createBillingPortalSession(locale);
}
