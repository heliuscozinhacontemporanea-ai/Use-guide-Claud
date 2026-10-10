import type { PaidPlanId } from '../types/payment';

const PAID_PLAN_IDS: readonly PaidPlanId[] = ['monthly', 'semi-annual', 'annual'];

export function isPaidPlanId(value: string): value is PaidPlanId {
  return (PAID_PLAN_IDS as readonly string[]).includes(value);
}
