import {
  type BillingLocale,
  type StartPlanSubscriptionResult,
  startPlanSubscriptionUseCase,
} from '../../domain/payment';
import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';
import { loadPaidPlanForBilling } from './paidPlanForBilling';

/** Assinatura no cartão do plano de um estabelecimento (D2, D11). O Pix avulso segue no PaymentIntent. */
export async function startPartnerPlanSubscriptionApplicationUseCase(
  actor: { uid: string; email?: string },
  input: { itemId: string; planId: string; locale: BillingLocale; idempotencyKey: string }
): Promise<StartPlanSubscriptionResult> {
  const plan = await loadPaidPlanForBilling(input.planId);
  const { currentPlanUntil } = await assertListingPlanPurchasableApplicationUseCase(
    actor,
    input.itemId
  );

  return startPlanSubscriptionUseCase({
    itemId: input.itemId,
    partnerId: actor.uid,
    email: actor.email,
    locale: input.locale,
    ...plan,
    currentVerifiedUntil: currentPlanUntil,
    idempotencyKey: input.idempotencyKey,
  });
}
