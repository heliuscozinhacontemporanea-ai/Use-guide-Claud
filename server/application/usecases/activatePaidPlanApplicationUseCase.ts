import { addDays, addMonths } from 'date-fns';
import {
  applyListingPaidPlanUseCase,
  getListingPlanUntilUseCase,
  isPaidListingPlanType,
  type PaidListingPlanType,
} from '../../domain/partners';
import { loadPlanListing } from './listingPlans/loadPlanListing';
import { syncListingSealApplicationUseCase } from './listingPlans/syncListingSealApplicationUseCase';

export type PaidPlanId = PaidListingPlanType;

const PLAN_DURATION_MONTHS: Record<PaidPlanId, number> = {
  monthly: 1,
  'semi-annual': 6,
  annual: 12,
};

// Margem para a renovação automática do Stripe confirmar sem o selo piscar.
const SUBSCRIPTION_GRACE_DAYS = 2;

export const isPaidPlanId = isPaidListingPlanType;

export function getPaidPlanDurationMonths(planId: PaidPlanId): number {
  return PLAN_DURATION_MONTHS[planId];
}

/** Plano pago confirmado pelo Stripe (assinatura ou pagamento avulso) no estabelecimento (D11). */
export async function activatePaidPlanApplicationUseCase(params: {
  itemId: string;
  partnerId: string;
  planId: string;
  paymentReference: string;
  subscriptionPeriodEnd?: string | null;
}): Promise<{ verifiedUntil: string }> {
  if (!isPaidPlanId(params.planId)) {
    throw new Error(`Plano pago inválido: ${params.planId}`);
  }
  const listing = await loadPlanListing(params.itemId);
  // A metadata é gravada pelo backend; dono diferente indica item transferido ou excluído.
  if (listing.ownerId !== params.partnerId) {
    throw new Error('Plano pago de estabelecimento que não pertence ao parceiro.');
  }

  let verifiedUntil: Date;
  if (params.subscriptionPeriodEnd) {
    verifiedUntil = addDays(new Date(params.subscriptionPeriodEnd), SUBSCRIPTION_GRACE_DAYS);
  } else {
    const now = new Date();
    const currentUntil = await getListingPlanUntilUseCase(params.itemId);
    // Renovação antecipada não pode apagar os dias que o parceiro já pagou.
    const base = currentUntil && new Date(currentUntil) > now ? new Date(currentUntil) : now;
    verifiedUntil = addMonths(base, PLAN_DURATION_MONTHS[params.planId]);
  }

  const verifiedUntilIso = verifiedUntil.toISOString();
  await applyListingPaidPlanUseCase(listing, params.planId, verifiedUntilIso);
  await syncListingSealApplicationUseCase(params.itemId);
  console.info('[activatePaidPlanApplicationUseCase]', {
    itemId: params.itemId,
    partnerId: params.partnerId,
    planId: params.planId,
    paymentReference: params.paymentReference,
    verifiedUntil: verifiedUntilIso,
  });
  return { verifiedUntil: verifiedUntilIso };
}
