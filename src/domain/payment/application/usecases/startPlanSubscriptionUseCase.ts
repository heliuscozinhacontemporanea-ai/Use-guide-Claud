import { paymentApiAdapter } from '../../factory';
import type {
  StartPlanSubscriptionPayload,
  StartPlanSubscriptionResponse,
} from '../../types/payment';

export async function startPlanSubscriptionUseCase(
  payload: StartPlanSubscriptionPayload
): Promise<StartPlanSubscriptionResponse> {
  return paymentApiAdapter.startPlanSubscription(payload);
}
