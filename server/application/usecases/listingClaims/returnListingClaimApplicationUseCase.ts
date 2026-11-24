import {
  archiveOffersOfGuideItemUseCase,
  hasActiveBookingsForGuideItemUseCase,
} from '../../../domain/bookings';
import { countOpenEstablishmentEventsUseCase } from '../../../domain/events';
import { getItemByIdUseCase, transferGuideItemOwnerUseCase } from '../../../domain/guide';
import {
  completeListingClaimReturnUseCase,
  deleteListingPlanUseCase,
  getApprovedListingClaimUseCase,
  getListingPlanUntilUseCase,
  ListingClaimError,
  type ListingClaimView,
  toListingClaimView,
} from '../../../domain/partners';
import { USE_GUIDE_OWNER_ID } from '../../../shared/kernel/useGuideOwner';
import { syncListingSealApplicationUseCase } from '../listingPlans/syncListingSealApplicationUseCase';
import { unlinkOwnerBusiness } from '../ownerBusinessLink';
import { notifyListingClaim } from './notifyListingClaim';

/**
 * O admin devolve ao Use Guide um anúncio aprovado por engano (D35, 6a). Só antes de o anúncio ter
 * reservas, eventos ou plano em vigor do novo dono; as ofertas sem reserva são arquivadas.
 */
export async function returnListingClaimApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  claimId: string,
  now: Date = new Date()
): Promise<ListingClaimView> {
  const claim = await getApprovedListingClaimUseCase(actor, claimId);
  const planUntil = await getListingPlanUntilUseCase(claim.itemId);
  if (
    (await hasActiveBookingsForGuideItemUseCase(claim.itemId)) ||
    (await countOpenEstablishmentEventsUseCase(claim.itemId)) > 0 ||
    (planUntil !== null && new Date(planUntil) > now)
  ) {
    throw new ListingClaimError(
      'LISTING_IN_USE',
      'O anúncio já tem reservas, eventos ou plano do novo dono; resolva com ele pelo suporte.'
    );
  }
  const moved = await transferGuideItemOwnerUseCase(
    claim.itemId,
    claim.claimantId,
    USE_GUIDE_OWNER_ID
  );
  if (!moved) {
    throw new ListingClaimError('NOT_APPROVED', 'O anúncio não está com quem pediu.');
  }
  await archiveOffersOfGuideItemUseCase(claim.itemId);
  await unlinkOwnerBusiness(claim.claimantId, claim.itemId);
  await deleteListingPlanUseCase(claim.itemId);
  const returned = await completeListingClaimReturnUseCase(actor, claim);
  await syncListingSealApplicationUseCase(claim.itemId);
  const item = await getItemByIdUseCase(claim.itemId);
  await notifyListingClaim(returned, 'returned', item?.name ?? '');
  return toListingClaimView(returned);
}
