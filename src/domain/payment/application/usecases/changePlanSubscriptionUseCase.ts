import { paymentApiAdapter } from '../../factory';
import type { PaidPlanId, PlanSubscription } from '../../types/payment';

/** Troca o período na próxima renovação (D13); escolher o período atual desfaz a troca. */
export async function changePlanSubscriptionUseCase(params: {
  itemId: string;
  planId: PaidPlanId;
  idempotencyKey: string;
}): Promise<PlanSubscription | null> {
  return paymentApiAdapter.changePlanSubscription(params);
}
