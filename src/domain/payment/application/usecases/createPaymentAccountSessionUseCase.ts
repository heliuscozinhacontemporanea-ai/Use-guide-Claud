import { paymentApiAdapter } from '../../factory';

export function createPaymentAccountSessionUseCase(
  accountKey: string
): Promise<{ clientSecret: string }> {
  return paymentApiAdapter.createPaymentAccountSession(accountKey);
}
