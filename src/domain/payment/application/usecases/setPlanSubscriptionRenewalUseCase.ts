import { paymentApiAdapter } from '../../factory';
import type { PlanSubscription } from '../../types/payment';

/** `renew = false` agenda o cancelamento para o fim do período já pago; `true` desfaz o agendamento. */
export async function setPlanSubscriptionRenewalUseCase(
  itemId: string,
  renew: boolean
): Promise<PlanSubscription | null> {
  return paymentApiAdapter.setPlanSubscriptionRenewal(itemId, renew);
}
