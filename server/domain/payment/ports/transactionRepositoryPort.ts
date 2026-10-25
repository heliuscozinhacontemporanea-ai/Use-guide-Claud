import type { PaymentStatus, PaymentTransaction } from './paymentGatewayPort';

export interface TransactionRecord {
  id: string;
  userId: string | null;
  referenceType?: string;
  referenceId?: string | null;
  providerPaymentId?: string | null;
  connectedAccountId?: string | null;
  amount: number | null;
  amountMinor?: number | null;
  platformFeeMinor?: number | null;
  paymentMethod: string | null;
  status: string | null;
  createdAt: unknown;
  updatedAt: unknown;
  paymentDetail?: Record<string, unknown>;
}

export type WebhookEventClaimResult = 'claimed' | 'already_processed' | 'in_progress';

export interface TransactionRepositoryPort {
  updateTransactionStatus(
    transactionId: string,
    status: string,
    statusDetail?: string
  ): Promise<boolean>;
  getTransaction(transactionId: string): Promise<TransactionRecord | null>;
  getTransactionByIdempotencyKey(idempotencyKey: string): Promise<TransactionRecord | null>;
  saveTransactionRecord(record: {
    transactionId: string;
    idempotencyKey: string;
    userId: string;
    referenceType: string;
    referenceId: string;
    providerPaymentId: string;
    connectedAccountId?: string;
    amountMinor: number;
    platformFeeMinor: number;
    paymentMethod: string;
    status: PaymentStatus | string;
    paymentResult?: Record<string, unknown>;
  }): Promise<PaymentTransaction>;
  claimWebhookEvent(params: {
    eventId: string;
    eventType: string;
    leaseMs: number;
  }): Promise<WebhookEventClaimResult>;
  completeWebhookEvent(eventId: string): Promise<void>;
  releaseWebhookEvent(eventId: string, errorMessage: string): Promise<void>;
}
