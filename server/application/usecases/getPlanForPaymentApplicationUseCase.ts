import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';

export async function getPlanForPaymentApplicationUseCase(
  planId: string
) {
  if (!planId) {
    return null;
  }
  return getSubscriptionPlanByIdUseCase(planId);
}
