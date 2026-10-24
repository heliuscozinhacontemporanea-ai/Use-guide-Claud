import type { PlanSubscription } from '../../types/payment';

/** Estados em que a assinatura ainda cobra: trocar período e cancelar a renovação fazem sentido. */
export const LIVE_SUBSCRIPTION_STATUSES: ReadonlySet<PlanSubscription['status']> = new Set([
  'active',
  'trialing',
  'past_due',
]);
