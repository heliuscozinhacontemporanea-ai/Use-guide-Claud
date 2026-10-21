import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
import {
  type BillingLocale,
  PaymentDomainError,
  type StartPlanSubscriptionResult,
  startPlanSubscriptionUseCase,
} from '../../domain/payment';
import { isPaidPlanId, type PaidPlanId } from './activatePaidPlanApplicationUseCase';
import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';

const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; intervalCount: number }> =
  {
    monthly: { interval: 'month', intervalCount: 1 },
    'semi-annual': { interval: 'month', intervalCount: 6 },
    annual: { interval: 'year', intervalCount: 1 },
  };

/** Assinatura no cartão do plano de um estabelecimento (D2, D11). O Pix avulso segue no PaymentIntent. */
export async function startPartnerPlanSubscriptionApplicationUseCase(
  actor: { uid: string; email?: string },
  input: { itemId: string; planId: string; locale: BillingLocale; idempotencyKey: string }
): Promise<StartPlanSubscriptionResult> {
  if (!isPaidPlanId(input.planId)) {
    throw new PaymentDomainError('VALIDATION_ERROR', 'Plano inválido.', 400);
  }
  const plan = await getSubscriptionPlanByIdUseCase(input.planId);
  if (!plan || plan.isActive === false) {
    throw new PaymentDomainError('PLAN_INACTIVE', 'Plano indisponível.', 422);
  }
  const { currentPlanUntil } = await assertListingPlanPurchasableApplicationUseCase(
    actor,
    input.itemId
  );

  return startPlanSubscriptionUseCase({
    itemId: input.itemId,
    partnerId: actor.uid,
    email: actor.email,
    locale: input.locale,
    planId: input.planId,
    planName: plan.name,
    amountMinor: plan.priceMinor,
    ...BILLING_INTERVAL[input.planId],
    currentVerifiedUntil: currentPlanUntil,
    idempotencyKey: input.idempotencyKey,
  });
}
