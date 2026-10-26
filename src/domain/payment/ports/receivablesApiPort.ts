import type { AccountDebtView, PayoutPage } from '../types/receivables';

export interface ReceivablesApiPort {
  listPayouts(query: { accountKey?: string; cursor?: string; limit?: number }): Promise<PayoutPage>;
  listDebts(): Promise<AccountDebtView[]>;
  startDebtPayment(debtId: string): Promise<{ clientSecret: string }>;
  declareForceMajeure(
    debtId: string,
    declaration: { reason: string; proofPath: string }
  ): Promise<AccountDebtView>;
}
