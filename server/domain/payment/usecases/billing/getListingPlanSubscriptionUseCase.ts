import { getBillingService } from '../../factory';
import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';

export async function getListingPlanSubscriptionUseCase(
  itemId: string,
  partnerId: string
): Promise<PlanSubscriptionRecord | null> {
  return getBillingService().getListingSubscription(itemId, partnerId);
}
