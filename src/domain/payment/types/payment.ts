export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'disputed';

export type PaidPlanId = 'monthly' | 'semi-annual' | 'annual';

/** O plano é de um estabelecimento (D11): o backend confere dono e verificação pelo `itemId`. */
export interface CreatePlanPaymentIntentPayload {
  itemId: string;
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

/** Conta Stripe de um CNPJ verificado (D14); `account` é `null` antes de o parceiro iniciar o cadastro. */
export interface PartnerPaymentAccount {
  accountKey: string;
  maskedDocument: string;
  itemIds: string[];
  account: {
    status: 'pending' | 'restricted' | 'enabled' | 'disabled';
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    requirementsDueCount: number;
    /** Calculado no servidor: mesmo critério usado para vender. */
    readyForSales: boolean;
  } | null;
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
  itemId: string;
  planId: PaidPlanId;
  status: PlanSubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** Período escolhido para a próxima renovação (D13); `null` sem troca agendada. */
  pendingPlanId: PaidPlanId | null;
  pendingChangeAt: string | null;
}

/** Período do catálogo exibido na troca; o backend recalcula o valor ao cobrar (§8.5). */
export interface PlanPeriodOption {
  id: PaidPlanId;
  name: string;
  priceMinor: number;
}

export interface StartPlanSubscriptionPayload {
  itemId: string;
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
