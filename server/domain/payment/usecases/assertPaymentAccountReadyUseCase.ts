import { paymentAccountService } from '../factory';

/** Lança `PaymentDomainError` (422) se a conta do CNPJ não pode receber (D14). */
export async function assertPaymentAccountReadyUseCase(accountKey: string): Promise<void> {
  await paymentAccountService.assertReady(accountKey);
}
