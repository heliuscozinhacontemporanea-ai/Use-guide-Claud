import { paymentAccountService } from '../factory';
import type { PaymentAccountView } from '../types/paymentAccount';

export function listOwnerPaymentAccountsUseCase(ownerUid: string): Promise<PaymentAccountView[]> {
  return paymentAccountService.listForOwner(ownerUid);
}
