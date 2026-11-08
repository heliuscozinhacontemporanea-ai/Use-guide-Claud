import { adminFinanceApiAdapter } from '../../factory';
import type { SaleClaimDecisionInput } from '../../types/adminFinance';

/** O backend recalcula o teto do reembolso e só aceita a multa no serviço que não aconteceu. */
export function decideSaleClaimUseCase(
  claimId: string,
  decision: SaleClaimDecisionInput
): Promise<void> {
  return adminFinanceApiAdapter.decideSaleClaim(claimId, decision);
}
