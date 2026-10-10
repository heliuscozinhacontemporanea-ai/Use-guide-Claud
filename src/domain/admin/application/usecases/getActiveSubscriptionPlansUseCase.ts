import { adminPlansAdapter } from '../../factory';
import { SubscriptionPlan } from '../../types/admin';

export async function getActiveSubscriptionPlansUseCase(): Promise<SubscriptionPlan[]> {
  return adminPlansAdapter.getActivePlans();
}
