import { receivablesApiAdapter } from '../../factory';
import type { BuyerSaleClaim, SaleClaimReason } from '../../types/saleClaims';

/** O backend confere que quem reclama é o comprador e que está dentro do prazo (D16, 2A). */
export function openSaleClaimUseCase(input: {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  reason: SaleClaimReason;
  details?: string;
}): Promise<BuyerSaleClaim> {
  return receivablesApiAdapter.openSaleClaim(input);
}
