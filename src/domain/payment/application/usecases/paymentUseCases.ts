import { paymentApiAdapter } from '../../factory';
import type {
  CreatePaymentIntentResponse,
  CreatePlanPaymentIntentPayload,
  PartnerConnectStatusResponse,
} from '../../types/payment';

export async function createPlanPaymentIntentUseCase(
  payload: CreatePlanPaymentIntentPayload
): Promise<CreatePaymentIntentResponse> {
  return paymentApiAdapter.createPlanPaymentIntent(payload);
}

export async function confirmPlanPaymentReturnUseCase(params: {
  paymentIntentId: string;
}): Promise<{ status: string }> {
  return paymentApiAdapter.confirmPlanPaymentReturn(params);
}

export async function getPartnerConnectStatusUseCase(): Promise<PartnerConnectStatusResponse> {
  return paymentApiAdapter.getPartnerConnectStatus();
}

export async function createPartnerConnectAccountUseCase(): Promise<PartnerConnectStatusResponse> {
  return paymentApiAdapter.createPartnerConnectAccount();
}

export async function createPartnerConnectAccountSessionUseCase(): Promise<{
  clientSecret: string;
}> {
  return paymentApiAdapter.createPartnerConnectAccountSession();
}
