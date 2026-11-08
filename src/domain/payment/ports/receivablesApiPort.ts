import type { AccountDebtView, PayoutPage } from '../types/receivables';
import type { BuyerSaleClaim, SaleClaimReason } from '../types/saleClaims';

export interface ReceivablesApiPort {
  listPayouts(query: { accountKey?: string; cursor?: string; limit?: number }): Promise<PayoutPage>;
  listDebts(): Promise<AccountDebtView[]>;
  startDebtPayment(debtId: string): Promise<{ clientSecret: string }>;
  declareForceMajeure(
    debtId: string,
    declaration: { reason: string; proofPath: string }
  ): Promise<AccountDebtView>;
  listMySaleClaims(): Promise<BuyerSaleClaim[]>;
  openSaleClaim(input: {
    referenceType: 'ticket_order' | 'booking';
    referenceId: string;
    reason: SaleClaimReason;
    details?: string;
  }): Promise<BuyerSaleClaim>;
}
