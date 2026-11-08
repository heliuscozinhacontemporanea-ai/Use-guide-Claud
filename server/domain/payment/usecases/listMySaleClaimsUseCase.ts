import { saleClaimService } from '../factory';
import type { BuyerSaleClaimView } from '../types/saleClaim';

export function listMySaleClaimsUseCase(buyerUid: string): Promise<BuyerSaleClaimView[]> {
  return saleClaimService.listForBuyer(buyerUid);
}
