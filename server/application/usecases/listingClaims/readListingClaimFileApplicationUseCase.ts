import { readVerificationFileUseCase } from '../../../domain/media';
import {
  getListingClaimFilePathUseCase,
  type ListingVerificationFiles,
} from '../../../domain/partners';

/** Admin abre o documento do pedido pelo backend: o arquivo nunca ganha URL pública nem assinada. */
export async function readListingClaimFileApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  claimId: string,
  kind: keyof ListingVerificationFiles
): Promise<{ data: Buffer; contentType: string } | null> {
  const path = await getListingClaimFilePathUseCase(actor, claimId, kind);
  if (!path) return null;
  // Auditoria (AGENTS.md §7.10 A09): quem abriu qual documento, sem dado pessoal no log.
  console.info('[audit] listing_claim_file_read', { adminUid: actor.uid, claimId, kind });
  return readVerificationFileUseCase(path);
}
