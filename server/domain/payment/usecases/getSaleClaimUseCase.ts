import { saleClaimService } from '../factory';
import type { SaleClaim } from '../types/saleClaim';

export function getSaleClaimUseCase(claimId: string): Promise<SaleClaim | null> {
  return saleClaimService.get(claimId);
}
