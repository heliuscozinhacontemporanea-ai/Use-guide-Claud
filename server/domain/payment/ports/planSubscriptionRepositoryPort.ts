import type { ProviderSubscriptionStatus } from './billingGatewayPort';

/** Coleção interna `partnerSubscriptions/{partnerId}` (só backend). */
export interface PlanSubscriptionRecord {
  partnerId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  planId: string;
  status: ProviderSubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
}

export interface PlanSubscriptionRepositoryPort {
  get(partnerId: string): Promise<PlanSubscriptionRecord | null>;
  save(record: PlanSubscriptionRecord): Promise<void>;
}
