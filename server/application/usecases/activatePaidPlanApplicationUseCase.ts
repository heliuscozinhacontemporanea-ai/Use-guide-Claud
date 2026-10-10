import { addDays, addMonths } from 'date-fns';
import { getPartnerProfileUseCase } from '../../domain/partners';
import { verifyPartnerApplicationUseCase } from './verifyPartnerApplicationUseCase';

export type PaidPlanId = 'monthly' | 'semi-annual' | 'annual';

const PLAN_DURATION_MONTHS: Record<PaidPlanId, number> = {
  monthly: 1,
  'semi-annual': 6,
  annual: 12,
};

// Margem para a renovação automática do Stripe confirmar sem o selo piscar.
const SUBSCRIPTION_GRACE_DAYS = 2;

export function isPaidPlanId(value: string): value is PaidPlanId {
  return Object.hasOwn(PLAN_DURATION_MONTHS, value);
}

export function getPaidPlanDurationMonths(planId: PaidPlanId): number {
  return PLAN_DURATION_MONTHS[planId];
}

export async function activatePaidPlanApplicationUseCase(params: {
  partnerId: string;
  planId: string;
  paymentReference: string;
  subscriptionPeriodEnd?: string | null;
}): Promise<{ verifiedUntil: string }> {
  if (!isPaidPlanId(params.planId)) {
    throw new Error(`Plano pago inválido: ${params.planId}`);
  }

  let verifiedUntil: Date;
  if (params.subscriptionPeriodEnd) {
    verifiedUntil = addDays(new Date(params.subscriptionPeriodEnd), SUBSCRIPTION_GRACE_DAYS);
  } else {
    const profile = await getPartnerProfileUseCase(params.partnerId);
    const now = new Date();
    const currentUntil = profile?.verifiedUntil ? new Date(profile.verifiedUntil) : null;
    // Renovação antecipada não pode apagar os dias que o parceiro já pagou.
    const base = currentUntil && currentUntil > now ? currentUntil : now;
    verifiedUntil = addMonths(base, PLAN_DURATION_MONTHS[params.planId]);
  }

  const verifiedUntilIso = verifiedUntil.toISOString();
  await verifyPartnerApplicationUseCase(params.partnerId, true, verifiedUntilIso, params.planId);
  console.info('[activatePaidPlanApplicationUseCase]', {
    partnerId: params.partnerId,
    planId: params.planId,
    paymentReference: params.paymentReference,
    verifiedUntil: verifiedUntilIso,
  });
  return { verifiedUntil: verifiedUntilIso };
}
