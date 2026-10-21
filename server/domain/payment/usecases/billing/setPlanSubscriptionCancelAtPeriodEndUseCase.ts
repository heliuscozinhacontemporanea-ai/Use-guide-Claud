import { getBillingService } from '../../factory';
import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';

export async function setPlanSubscriptionCancelAtPeriodEndUseCase(
  itemId: string,
  partnerId: string,
  cancel: boolean
): Promise<PlanSubscriptionRecord> {
  return getBillingService().setCancelAtPeriodEnd(itemId, partnerId, cancel);
}
