import {
  getListingPlanViewUseCase,
  getListingVerificationStatusUseCase,
  type ListingPlanView,
} from '../../../domain/partners';
import { loadPlanListing } from './loadPlanListing';

export async function getListingPlanApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<ListingPlanView> {
  const listing = await loadPlanListing(itemId);
  const verification = await getListingVerificationStatusUseCase(itemId);
  return getListingPlanViewUseCase(actor, listing, verification);
}
