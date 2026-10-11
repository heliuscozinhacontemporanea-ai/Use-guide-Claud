import { getBillingService } from '../../factory';
import type { SubscriptionSnapshot } from '../../ports/billingGatewayPort';

export async function syncPlanSubscriptionUseCase(
  subscriptionId: string
): Promise<SubscriptionSnapshot> {
  return getBillingService().syncSubscription(subscriptionId);
}
