import { paymentApiAdapter } from '../../factory';
import type { PlanSubscription } from '../../types/payment';

/** Assinatura do plano de um estabelecimento (D11); `null` se ele nunca assinou. */
export async function getPlanSubscriptionUseCase(itemId: string): Promise<PlanSubscription | null> {
  return paymentApiAdapter.getPlanSubscription(itemId);
}
