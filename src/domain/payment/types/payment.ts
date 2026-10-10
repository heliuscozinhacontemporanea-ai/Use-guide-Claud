export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'disputed';

export interface CreatePlanPaymentIntentPayload {
  itemId: string;
  billingCycle?: 'monthly' | 'quarterly' | 'semiannual';
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
}
