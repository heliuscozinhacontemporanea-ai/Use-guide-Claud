import {
  getListingVerificationUseCase,
  ListingVerificationError,
  type ListingVerificationView,
} from '../../../domain/partners';
import { loadVerificationListing } from './loadVerificationListing';

export async function getListingVerificationApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<ListingVerificationView> {
  const listing = await loadVerificationListing(itemId);
  if (!listing) {
    throw new ListingVerificationError('NOT_FOUND', 'Estabelecimento não encontrado.');
  }
  return getListingVerificationUseCase(actor, listing);
}
