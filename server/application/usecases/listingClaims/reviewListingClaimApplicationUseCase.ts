import { getItemByIdUseCase, transferGuideItemOwnerUseCase } from '../../../domain/guide';
import {
  completeListingClaimApprovalUseCase,
  deleteListingPlanUseCase,
  getPendingListingClaimUseCase,
  ListingClaimError,
  type ListingClaimView,
  rejectListingClaimUseCase,
  toListingClaimView,
} from '../../../domain/partners';
import { USE_GUIDE_OWNER_ID } from '../../../shared/kernel/useGuideOwner';
import { syncListingSealApplicationUseCase } from '../listingPlans/syncListingSealApplicationUseCase';
import { linkOwnerBusiness } from '../ownerBusinessLink';
import { notifyListingClaim } from './notifyListingClaim';

/**
 * Decisão do admin sobre o "Sou o dono" (D35). Aprovar passa o anúncio para a conta com fotos,
 * avaliações e nota (6a), sem nada de admin: o plano e o selo do Use Guide saem (item 8). Cada passo
 * pode ser repetido; o pedido só fica aprovado no fim, então o admin tenta de novo se algo falhar.
 */
export async function reviewListingClaimApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  claimId: string,
  decision: 'approve' | 'reject',
  reason: string | null
): Promise<ListingClaimView> {
  if (decision === 'reject') {
    const rejected = await rejectListingClaimUseCase(actor, claimId, reason);
    const item = await getItemByIdUseCase(rejected.itemId);
    await notifyListingClaim(rejected, 'rejected', item?.name ?? '');
    return toListingClaimView(rejected);
  }
  const claim = await getPendingListingClaimUseCase(actor, claimId);
  const moved = await transferGuideItemOwnerUseCase(
    claim.itemId,
    USE_GUIDE_OWNER_ID,
    claim.claimantId
  );
  if (!moved) {
    throw new ListingClaimError('LISTING_NOT_CLAIMABLE', 'Este anúncio já tem outro dono.');
  }
  const item = await getItemByIdUseCase(claim.itemId);
  const listingName = item?.name ?? '';
  await linkOwnerBusiness(claim.claimantId, {
    businessId: claim.itemId,
    businessName: listingName,
    type: 'item',
  });
  await deleteListingPlanUseCase(claim.itemId);
  const siblings = await completeListingClaimApprovalUseCase(actor, claim);
  await syncListingSealApplicationUseCase(claim.itemId);
  const approved = { ...claim, status: 'approved' as const };
  await notifyListingClaim(approved, 'approved', listingName);
  for (const sibling of siblings) await notifyListingClaim(sibling, 'rejected', listingName);
  return toListingClaimView({ ...approved, reviewedBy: actor.uid });
}
