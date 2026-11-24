import { getItemByIdUseCase } from '../../../domain/guide';
import { listMyListingClaimsUseCase } from '../../../domain/partners';
import type { MyListingClaim } from './listingClaimDtos';

/** Pedidos de quem pediu, com o nome do lugar, para o Início do painel (D35, telas 8 e 9). */
export async function listMyListingClaimsApplicationUseCase(
  claimantId: string
): Promise<MyListingClaim[]> {
  const claims = await listMyListingClaimsUseCase(claimantId);
  return Promise.all(
    claims.map(async ({ claimantId: _claimant, ...claim }) => {
      const item = await getItemByIdUseCase(claim.itemId);
      return { ...claim, listingName: typeof item?.name === 'string' ? item.name : '' };
    })
  );
}
