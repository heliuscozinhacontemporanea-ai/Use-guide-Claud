import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
import { getPartnerProfileUseCase } from '../../domain/partners';
import {
  type BillingLocale,
  PaymentDomainError,
  type StartPlanSubscriptionResult,
  startPlanSubscriptionUseCase,
} from '../../domain/payment';
import { isPaidPlanId, type PaidPlanId } from './activatePaidPlanApplicationUseCase';

const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; intervalCount: number }> =
  {
    monthly: { interval: 'month', intervalCount: 1 },
    'semi-annual': { interval: 'month', intervalCount: 6 },
    annual: { interval: 'year', intervalCount: 1 },
  };

/** Assinatura no cartão com renovação automática (decisão D2). O Pix avulso continua no fluxo de PaymentIntent. */
export async function startPartnerPlanSubscriptionApplicationUseCase(
  actor: { uid: string; email?: string },
  input: { planId: string; locale: BillingLocale; idempotencyKey: string }
): Promise<StartPlanSubscriptionResult> {
  if (!isPaidPlanId(input.planId)) {
    throw new PaymentDomainError('VALIDATION_ERROR', 'Plano inválido.', 400);
  }
  const plan = await getSubscriptionPlanByIdUseCase(input.planId);
  if (!plan || plan.isActive === false) {
    throw new PaymentDomainError('PLAN_INACTIVE', 'Plano indisponível.', 422);
  }
  const profile = await getPartnerProfileUseCase(actor.uid);
  if (!profile) {
    throw new PaymentDomainError('FORBIDDEN', 'Cadastro de parceiro não encontrado.', 403);
  }

  return startPlanSubscriptionUseCase({
    partnerId: actor.uid,
    email: actor.email,
    locale: input.locale,
    planId: input.planId,
    planName: plan.name,
    amountMinor: Math.round(Number(plan.price) * 100),
    ...BILLING_INTERVAL[input.planId],
    currentVerifiedUntil: profile.verifiedUntil ?? null,
    idempotencyKey: input.idempotencyKey,
  });
}
