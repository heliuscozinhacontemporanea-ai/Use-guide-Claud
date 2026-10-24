export type ProviderSubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export type BillingLocale = 'pt-BR' | 'en' | 'fr';

export interface SubscriptionSnapshot {
  subscriptionId: string;
  customerId: string;
  status: ProviderSubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, string>;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  customerId: string;
  status: ProviderSubscriptionStatus;
  currentPeriodEnd: string | null;
  /** Segredo para o Payment Element: da fatura (cobrança imediata) ou do SetupIntent (período de teste). */
  clientSecret: string | null;
  intentType: 'payment' | 'setup' | null;
}

/** Assinaturas recorrentes no provedor de pagamento (Stripe Billing). */
export interface BillingGatewayPort {
  ensureCustomer(params: {
    existingCustomerId: string | null;
    partnerId: string;
    email?: string;
    locale: BillingLocale;
  }): Promise<string>;
  ensureRecurringPrice(params: {
    lookupKey: string;
    amountMinor: number;
    interval: 'month' | 'year';
    intervalCount: number;
    nickname: string;
  }): Promise<string>;
  createSubscription(params: {
    customerId: string;
    priceId: string;
    trialEndUnixSeconds: number | null;
    metadata: Record<string, string>;
    idempotencyKey: string;
  }): Promise<CreateSubscriptionResult>;
  getSubscription(subscriptionId: string): Promise<SubscriptionSnapshot>;
  setCancelAtPeriodEnd(subscriptionId: string, cancel: boolean): Promise<SubscriptionSnapshot>;
  cancelNow(subscriptionId: string): Promise<SubscriptionSnapshot>;
  createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
    locale: BillingLocale;
  }): Promise<{ url: string }>;
}
