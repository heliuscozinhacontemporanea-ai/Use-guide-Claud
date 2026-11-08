import { receivablesApiAdapter } from '../../factory';

export function startDebtPaymentUseCase(debtId: string): Promise<{ clientSecret: string }> {
  return receivablesApiAdapter.startDebtPayment(debtId);
}
