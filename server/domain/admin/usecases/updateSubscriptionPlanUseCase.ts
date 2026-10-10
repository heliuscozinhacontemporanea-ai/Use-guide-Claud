import type { UpdateSubscriptionPlanInput } from '../types/subscriptionPlan';
import { adminPlansService } from '../factory';

export async function updateSubscriptionPlanUseCase(
  planId: string,
  data: UpdateSubscriptionPlanInput
): Promise<void> {
  return adminPlansService.updatePlan(planId, data);
}
