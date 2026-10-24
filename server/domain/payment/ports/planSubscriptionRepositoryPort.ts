import type { ProviderSubscriptionStatus } from './billingGatewayPort';

/** Coleção interna `planSubscriptions/{itemId}` (D11, só backend). */
export interface PlanSubscriptionRecord {
  itemId: string;
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
  get(itemId: string): Promise<PlanSubscriptionRecord | null>;
  save(record: PlanSubscriptionRecord): Promise<void>;
  listByPartner(partnerId: string): Promise<PlanSubscriptionRecord[]>;
}
