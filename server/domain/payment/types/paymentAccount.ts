import type { ConnectedAccountStatus } from '../ports/marketplaceAccountPort';

/**
 * `paymentAccounts/{accountKey}`: conta Stripe Express de um CNPJ (D14). `accountKey` é o índice cego do
 * documento (HMAC), nunca o CNPJ.
 */
export interface PaymentAccountRecord {
  accountKey: string;
  ownerUid: string;
  stripeAccountId: string;
  status: ConnectedAccountStatus['status'];
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrentlyDue: string[];
  requirementsPastDue: string[];
  createdAt: string;
  updatedAt: string;
}

/** O que o parceiro vê de cada conta (sem IDs do Stripe). */
export interface PaymentAccountView {
  accountKey: string;
  status: ConnectedAccountStatus['status'];
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDueCount: number;
  readyForSales: boolean;
}
