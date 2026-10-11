import { paymentApiAdapter } from '../../factory';
import type { PlanSubscription } from '../../types/payment';

export async function getPlanSubscriptionUseCase(): Promise<PlanSubscription | null> {
  return paymentApiAdapter.getPlanSubscription();
}
