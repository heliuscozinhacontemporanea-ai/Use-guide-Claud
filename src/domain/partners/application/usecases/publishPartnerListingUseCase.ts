import { partnerHomeAdapter } from '../../factory';

/** Publica o rascunho no guia (D34); o servidor confere os passos da categoria. */
export function publishPartnerListingUseCase(itemId: string): Promise<void> {
  return partnerHomeAdapter.publishListing(itemId);
}
