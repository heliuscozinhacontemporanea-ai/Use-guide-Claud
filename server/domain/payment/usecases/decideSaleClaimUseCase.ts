import { saleClaimService } from '../factory';
import type { SaleClaimDecision } from '../services/saleClaimService';
import type { SaleClaim } from '../types/saleClaim';

/** Quem chama garante o papel de admin. */
export function decideSaleClaimUseCase(
  claimId: string,
  adminUid: string,
  decision: SaleClaimDecision
): Promise<SaleClaim> {
  return saleClaimService.decide(claimId, adminUid, decision);
}
