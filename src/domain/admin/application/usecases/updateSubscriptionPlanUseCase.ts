import { adminPlansAdapter } from '../../factory';

export function updateSubscriptionPlanUseCase(
  planId: string,
  data: {
    name?: string;
    priceMinor?: number;
    period?: string;
    description?: string;
    isActive?: boolean;
  }
) {
  return adminPlansAdapter.updatePlan(planId, data);
}
