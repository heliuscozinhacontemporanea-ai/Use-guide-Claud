import { getListingVerificationService } from '../factory';

/** CNPJ descriptografado do próprio parceiro, só para pré-preencher a conta Stripe do documento (D14). */
export function getOwnerSalesDocumentUseCase(ownerId: string, accountKey: string): Promise<string> {
  return getListingVerificationService().getSalesDocument(ownerId, accountKey);
}
