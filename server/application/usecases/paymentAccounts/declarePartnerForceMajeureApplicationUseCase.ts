import { isOwnVerificationFileUseCase } from '../../../domain/media';
import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import {
  type AccountDebtView,
  declareForceMajeureUseCase,
  PaymentDomainError,
} from '../../../domain/payment';

/**
 * O proprietário declara força maior na multa de cancelamento (D16, 3A). A prova é enviada antes por
 * `POST /api/media/verification-files` e precisa estar na pasta privada dele.
 */
export async function declarePartnerForceMajeureApplicationUseCase(
  ownerUid: string,
  debtId: string,
  declaration: { reason: string; proofPath: string }
): Promise<AccountDebtView> {
  if (!isOwnVerificationFileUseCase(ownerUid, declaration.proofPath)) {
    throw new PaymentDomainError('INVALID_PROOF_FILE', 'Arquivo de prova inválido.', 400);
  }
  const documents = await listOwnerSalesDocumentsUseCase(ownerUid);
  return declareForceMajeureUseCase(
    debtId,
    documents.map((document) => document.accountKey),
    { ...declaration, declaredBy: ownerUid }
  );
}
