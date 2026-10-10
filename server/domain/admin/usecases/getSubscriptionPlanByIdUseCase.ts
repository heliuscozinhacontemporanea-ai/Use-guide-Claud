import { adminPlansService } from '../factory';

export async function getSubscriptionPlanByIdUseCase(
  planId: string
) {
  return adminPlansService.getPlanById(planId);
}
