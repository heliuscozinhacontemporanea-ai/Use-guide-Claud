import { getBillingService } from '../../factory';
import type {
  StartPlanSubscriptionInput,
  StartPlanSubscriptionResult,
} from '../../services/billingService';

export async function startPlanSubscriptionUseCase(
  input: StartPlanSubscriptionInput
): Promise<StartPlanSubscriptionResult> {
  return getBillingService().startPlanSubscription(input);
}
