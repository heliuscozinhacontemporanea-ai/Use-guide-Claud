import {
  type PlanSubscriptionRecord,
  schedulePlanSubscriptionChangeUseCase,
} from '../../domain/payment';
import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';
import { loadPaidPlanForBilling } from './paidPlanForBilling';

/**
 * Troca do período da assinatura do estabelecimento na próxima renovação (D13). Os benefícios
 * são os mesmos em todos os períodos; muda só o ciclo e o valor da próxima cobrança.
 */
export async function changePartnerPlanSubscriptionApplicationUseCase(
  actor: { uid: string },
  input: { itemId: string; planId: string; idempotencyKey: string }
): Promise<PlanSubscriptionRecord> {
  const plan = await loadPaidPlanForBilling(input.planId);
  await assertListingPlanPurchasableApplicationUseCase(actor, input.itemId);
  return schedulePlanSubscriptionChangeUseCase({
    itemId: input.itemId,
    partnerId: actor.uid,
    ...plan,
    idempotencyKey: input.idempotencyKey,
  });
}
