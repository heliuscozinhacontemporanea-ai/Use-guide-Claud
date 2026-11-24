import { getItemByIdUseCase } from '../../../domain/guide';
import {
  type ListingClaimRecord,
  listListingClaimsForItemUseCase,
  listListingClaimsForReviewUseCase,
  toListingClaimView,
} from '../../../domain/partners';
import { getUserProfilesBatchUseCase } from '../../../domain/users';
import type { AdminListingClaim, ListingClaimListQuery } from './listingClaimDtos';

function nameOf(profile: { firstName?: string; lastName?: string } | undefined): string {
  return `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
}

/** Fila do admin (D35, 5b): cada pedido com os outros em análise para o mesmo lugar. */
export async function listListingClaimsApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  query: ListingClaimListQuery
): Promise<{ data: AdminListingClaim[]; nextCursor: string | null }> {
  const page = await listListingClaimsForReviewUseCase(
    actor,
    query.status,
    query.limit,
    query.cursor
  );
  const siblingsByItem = new Map<string, ListingClaimRecord[]>();
  for (const itemId of new Set(page.data.map((claim) => claim.itemId))) {
    const all = await listListingClaimsForItemUseCase(actor, itemId);
    siblingsByItem.set(
      itemId,
      all.filter((claim) => claim.status === 'pending')
    );
  }
  const uids = new Set(page.data.map((claim) => claim.claimantId));
  for (const siblings of siblingsByItem.values()) {
    for (const claim of siblings) uids.add(claim.claimantId);
  }
  const profiles = await getUserProfilesBatchUseCase([...uids]);
  const data: AdminListingClaim[] = [];
  for (const claim of page.data) {
    const item = await getItemByIdUseCase(claim.itemId);
    const { claimantId: _claimant, ...view } = toListingClaimView(claim);
    data.push({
      ...view,
      listing: {
        name: typeof item?.name === 'string' ? item.name : '',
        category: typeof item?.category === 'string' ? item.category : '',
        city: typeof item?.city === 'string' ? item.city : null,
      },
      claimantName: nameOf(profiles[claim.claimantId]),
      otherClaims: (siblingsByItem.get(claim.itemId) ?? [])
        .filter((sibling) => sibling.claimId !== claim.claimId)
        .map((sibling) => ({
          claimantName: nameOf(profiles[sibling.claimantId]),
          holderRole: sibling.holderRole,
          submittedAt: sibling.submittedAt,
        })),
    });
  }
  return { data, nextCursor: page.nextCursor };
}
