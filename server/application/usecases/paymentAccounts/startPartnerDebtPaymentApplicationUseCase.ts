import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { startAccountDebtPaymentUseCase } from '../../../domain/payment';

/** O parceiro só paga dívida de um CNPJ dele; a de outro responde 404 (AGENTS.md §7.10). */
export async function startPartnerDebtPaymentApplicationUseCase(
  ownerUid: string,
  debtId: string
): Promise<{ clientSecret: string }> {
  const documents = await listOwnerSalesDocumentsUseCase(ownerUid);
  return startAccountDebtPaymentUseCase(
    debtId,
    documents.map((document) => document.accountKey)
  );
}
