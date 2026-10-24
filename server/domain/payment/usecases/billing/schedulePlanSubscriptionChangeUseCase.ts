import { getBillingService } from '../../factory';
import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';
import type { SchedulePlanChangeInput } from '../../services/billingService';

export async function schedulePlanSubscriptionChangeUseCase(
  input: SchedulePlanChangeInput
): Promise<PlanSubscriptionRecord> {
  return getBillingService().schedulePlanChange(input);
}
