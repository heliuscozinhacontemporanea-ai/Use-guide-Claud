import { adminPlansService } from '../factory';

export async function getSubscriptionPlansUseCase() {
  return adminPlansService.getPlans();
}
