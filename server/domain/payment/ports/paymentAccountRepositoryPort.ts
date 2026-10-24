import type { PaymentAccountRecord } from '../types/paymentAccount';

export interface PaymentAccountRepositoryPort {
  get(accountKey: string): Promise<PaymentAccountRecord | null>;
  getByStripeAccountId(stripeAccountId: string): Promise<PaymentAccountRecord | null>;
  listByOwner(ownerUid: string): Promise<PaymentAccountRecord[]>;
  save(record: PaymentAccountRecord): Promise<void>;
}
