import { adminPlansAdapter } from '../../factory';

export function getAllSubscriptionPlansUseCase() {
  return adminPlansAdapter.getAllPlans();
}
