import { paymentApiAdapter } from '../../factory';

export async function confirmPlanPaymentReturnUseCase(params: {
  paymentIntentId: string;
}): Promise<{ status: string }> {
  return paymentApiAdapter.confirmPlanPaymentReturn(params);
}
