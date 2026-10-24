import { paymentApiAdapter } from '../../factory';
import type { PartnerPaymentAccount } from '../../types/payment';

export function listPaymentAccountsUseCase(): Promise<PartnerPaymentAccount[]> {
  return paymentApiAdapter.listPaymentAccounts();
}
