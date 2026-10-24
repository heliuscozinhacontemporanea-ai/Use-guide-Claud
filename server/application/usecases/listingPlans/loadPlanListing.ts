import { ListingPlanError, type PlanListing } from '../../../domain/partners';
import { loadVerificationListing } from '../listingVerification/loadVerificationListing';

export async function loadPlanListing(itemId: string): Promise<PlanListing> {
  const listing = await loadVerificationListing(itemId);
  if (!listing) throw new ListingPlanError('NOT_FOUND', 'Estabelecimento não encontrado.');
  return { id: listing.id, ownerId: listing.ownerId };
}
