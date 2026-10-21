import { getListingVerificationService } from '../factory';

/** Perfis de produtor que seguem a verificação deste estabelecimento (D12). */
export function listLinkedListingIdsUseCase(sourceItemId: string): Promise<string[]> {
  return getListingVerificationService().listLinkedItemIds(sourceItemId);
}
