import { listingVerificationAdapter } from '../../factory';
import type { VerificationFileKind } from '../../types/listingVerification';

export function readVerificationFileUseCase(
  itemId: string,
  kind: VerificationFileKind
): Promise<Blob> {
  return listingVerificationAdapter.readFile(itemId, kind);
}
