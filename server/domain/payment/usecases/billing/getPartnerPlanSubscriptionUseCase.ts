import { getBillingService } from '../../factory';
import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';

export async function getPartnerPlanSubscriptionUseCase(
  partnerId: string
): Promise<PlanSubscriptionRecord | null> {
  return getBillingService().getPartnerSubscription(partnerId);
}
