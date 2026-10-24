import { getListingVerificationService } from '../factory';
import type { OwnerSalesDocument } from '../types/listingVerification';

/** CNPJs aprovados do parceiro e os cadastros que vendem por cada um (D14). */
export function listOwnerSalesDocumentsUseCase(ownerId: string): Promise<OwnerSalesDocument[]> {
  return getListingVerificationService().listSalesDocuments(ownerId);
}
