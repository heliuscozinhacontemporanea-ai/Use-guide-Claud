import { isOwnVerificationFileUseCase } from '../../../domain/media';
import {
  ListingVerificationError,
  type ListingVerificationView,
  type SubmitListingVerificationInput,
  submitListingVerificationUseCase,
} from '../../../domain/partners';
import { loadVerificationListing } from './loadVerificationListing';

/** Envio da verificação do estabelecimento (D12): confere dono, origem do perfil de produtor e os arquivos. */
export async function submitListingVerificationApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  input: SubmitListingVerificationInput
): Promise<ListingVerificationView> {
  const listing = await loadVerificationListing(itemId);
  if (!listing) {
    throw new ListingVerificationError('NOT_FOUND', 'Estabelecimento não encontrado.');
  }
  for (const path of Object.values(input.files ?? {})) {
    if (path && !isOwnVerificationFileUseCase(actor.uid, path)) {
      throw new ListingVerificationError('FORBIDDEN', 'Arquivo de verificação inválido.');
    }
  }
  const source = input.sourceItemId ? await loadVerificationListing(input.sourceItemId) : null;
  return submitListingVerificationUseCase(actor, listing, input, source);
}
