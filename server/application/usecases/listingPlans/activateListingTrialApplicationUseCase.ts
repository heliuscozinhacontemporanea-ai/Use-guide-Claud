import {
  activateListingTrialUseCase,
  getListingVerificationStatusUseCase,
  type ListingPlanView,
} from '../../../domain/partners';
import { getListingPlanApplicationUseCase } from './getListingPlanApplicationUseCase';
import { loadPlanListing } from './loadPlanListing';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

/** Trial de 7 dias no estabelecimento escolhido, uma vez por conta (D11). */
export async function activateListingTrialApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<ListingPlanView> {
  const listing = await loadPlanListing(itemId);
  const verification = await getListingVerificationStatusUseCase(itemId);
  await activateListingTrialUseCase(actor, listing, verification);
  await syncListingSealApplicationUseCase(itemId);
  return getListingPlanApplicationUseCase(actor, itemId);
}
