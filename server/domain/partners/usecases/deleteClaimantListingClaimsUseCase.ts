import { getListingClaimService } from '../factory';

/** Exclusão da conta (LGPD, §7.5): apaga os pedidos e devolve os arquivos para remover. */
export function deleteClaimantListingClaimsUseCase(claimantId: string): Promise<string[]> {
  return getListingClaimService().deleteForClaimant(claimantId);
}
