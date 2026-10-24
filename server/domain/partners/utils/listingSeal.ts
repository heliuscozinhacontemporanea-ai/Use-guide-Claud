import type {
  ListingPlanRecord,
  ListingPlanType,
  ListingSeal,
  PaidListingPlanType,
} from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

const ADMIN_SEAL_DAYS = 365;
const DAY_MS = 86_400_000;

type PlanState = Pick<ListingPlanRecord, 'planType' | 'planUntil' | 'sealSuspended'>;

export const NO_SEAL: ListingSeal = {
  isVerified: false,
  verifiedUntil: null,
  verificationType: null,
  isVerificationSuspended: false,
};

export const EMPTY_PLAN: PlanState = { planType: null, planUntil: null, sealSuspended: false };

export function isPaidListingPlanType(value: string): value is PaidListingPlanType {
  return value === 'monthly' || value === 'semi-annual' || value === 'annual';
}

export function isPlanActive(plan: PlanState, now: Date): boolean {
  return Boolean(plan.planType && plan.planUntil && new Date(plan.planUntil) > now);
}

/** Plano pago ou trial em vigor: o admin nunca altera tipo nem validade dele (D8). */
export function hasActivePurchasedPlan(plan: PlanState, now: Date): boolean {
  return isPlanActive(plan, now) && plan.planType !== 'admin';
}

/**
 * Selo público (D11): plano ativo do estabelecimento **e** verificação aprovada pelo admin (D12).
 * Retirado pelo admin, o selo fica marcado como suspenso e os cards não o mostram.
 */
export function computeListingSeal(
  plan: PlanState,
  verification: ListingVerificationStatus | 'not_submitted',
  now: Date
): ListingSeal {
  if (!isPlanActive(plan, now) || verification !== 'approved') return NO_SEAL;
  return {
    isVerified: true,
    verifiedUntil: plan.planUntil,
    verificationType: plan.planType,
    isVerificationSuspended: plan.sealSuspended,
  };
}

/** O selo aparece nos cards: o mesmo critério que o frontend usa. */
export function isSealVisible(seal: ListingSeal): boolean {
  return seal.isVerified && !seal.isVerificationSuspended;
}

/**
 * Selo concedido ou retirado pelo admin. Com plano pago ou trial em vigor, só liga ou desliga a
 * suspensão; sem plano, concede o plano `admin` por um ano ou o remove.
 */
export function resolveAdminPlan(plan: PlanState, grant: boolean, now: Date): PlanState {
  if (hasActivePurchasedPlan(plan, now)) return { ...plan, sealSuspended: !grant };
  if (!grant) return EMPTY_PLAN;
  if (plan.planType === 'admin' && isPlanActive(plan, now)) {
    return { ...plan, sealSuspended: false };
  }
  return {
    planType: 'admin' satisfies ListingPlanType,
    planUntil: new Date(now.getTime() + ADMIN_SEAL_DAYS * DAY_MS).toISOString(),
    sealSuspended: false,
  };
}
