import { getListingVerificationService } from '../factory';
import type { ListingSalesAccount } from '../types/listingVerification';

/**
 * Lança `ListingVerificationError` (422) quando o estabelecimento ainda não pode vender (D12); devolve a
 * conta de recebimento do CNPJ dele (D14).
 */
export function assertListingCanSellUseCase(itemId: string): Promise<ListingSalesAccount> {
  return getListingVerificationService().assertCanSell(itemId);
}
