import { receivablesApiAdapter } from '../../factory';
import type { BuyerSaleClaim } from '../../types/saleClaims';

export function listMySaleClaimsUseCase(): Promise<BuyerSaleClaim[]> {
  return receivablesApiAdapter.listMySaleClaims();
}
