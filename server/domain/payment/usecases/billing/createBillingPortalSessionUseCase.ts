import { getBillingService } from '../../factory';
import type { BillingLocale } from '../../ports/billingGatewayPort';

export async function createBillingPortalSessionUseCase(
  partnerId: string,
  returnUrl: string,
  locale: BillingLocale
): Promise<{ url: string }> {
  return getBillingService().createPortalSession(partnerId, returnUrl, locale);
}
