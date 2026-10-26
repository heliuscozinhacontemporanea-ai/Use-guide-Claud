import { payoutService, saleClaimService } from '../factory';
import type { ReleaseSummary } from '../services/payoutService';

/** Job de hora em hora (D14): encerra as reclamações sem decisão em 5 dias e transfere os repasses vencidos. */
export async function releaseDuePayoutsUseCase(
  limit = 200
): Promise<ReleaseSummary & { expiredClaims: number }> {
  const expiredClaims = await saleClaimService.expireDue();
  return { ...(await payoutService.releaseDue(limit)), expiredClaims };
}
