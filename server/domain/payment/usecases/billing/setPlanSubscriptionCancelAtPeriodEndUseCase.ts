import { getBillingService } from '../../factory';
import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';

export async function setPlanSubscriptionCancelAtPeriodEndUseCase(
  partnerId: string,
  cancel: boolean
): Promise<PlanSubscriptionRecord> {
  return getBillingService().setCancelAtPeriodEnd(partnerId, cancel);
}
