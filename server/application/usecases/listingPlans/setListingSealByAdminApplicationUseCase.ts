import { type ListingPlanView, setListingSealByAdminUseCase } from '../../../domain/partners';
import { getListingPlanApplicationUseCase } from './getListingPlanApplicationUseCase';
import { loadPlanListing } from './loadPlanListing';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

/** Admin concede ou retira o selo de um estabelecimento sem mexer no plano pago (D8, D11). */
export async function setListingSealByAdminApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  grant: boolean
): Promise<ListingPlanView> {
  const listing = await loadPlanListing(itemId);
  await setListingSealByAdminUseCase(actor, listing, grant);
  await syncListingSealApplicationUseCase(itemId);
  console.info('[audit] listing_seal_admin', { adminUid: actor.uid, itemId, grant });
  return getListingPlanApplicationUseCase(actor, itemId);
}
