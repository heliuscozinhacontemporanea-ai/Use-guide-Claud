import { paymentApiAdapter } from '../../factory';
import type {
  CreatePaymentIntentResponse,
  CreatePlanPaymentIntentPayload,
} from '../../types/payment';

export async function createPlanPaymentIntentUseCase(
  payload: CreatePlanPaymentIntentPayload
): Promise<CreatePaymentIntentResponse> {
  return paymentApiAdapter.createPlanPaymentIntent(payload);
}
