import { getListingVerificationService } from '../factory';

/** Lança `ListingVerificationError` (422) quando o estabelecimento ainda não pode vender (D12). */
export function assertListingCanSellUseCase(itemId: string): Promise<void> {
  return getListingVerificationService().assertCanSell(itemId);
}
