export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'disputed';

export type PaidPlanId = 'monthly' | 'semi-annual' | 'annual';

export interface CreatePlanPaymentIntentPayload {
  planId: PaidPlanId;
  idempotencyKey: string;
}

export interface CreatePaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  status: PaymentStatus;
  transactionId: string;
  amountMinor?: number;
  orderStatus?: string;
}

export interface PartnerConnectStatusResponse {
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrentlyDue?: string[];
  requirementsPastDue?: string[];
  status: 'pending' | 'restricted' | 'enabled' | 'disabled';
  /** Calculado no servidor: mesmo critério usado para vender. */
  readyForSales: boolean;
}

export type PaymentLocale = 'pt-BR' | 'en' | 'fr';

export type PlanSubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export interface PlanSubscription {
  planId: PaidPlanId;
  status: PlanSubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface StartPlanSubscriptionPayload {
  planId: PaidPlanId;
  locale: PaymentLocale;
  idempotencyKey: string;
}

export interface StartPlanSubscriptionResponse {
  subscriptionId: string;
  status: PlanSubscriptionStatus;
  clientSecret: string | null;
  intentType: 'payment' | 'setup' | null;
}
