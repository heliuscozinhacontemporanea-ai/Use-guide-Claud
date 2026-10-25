import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { type AccountDebtView, listAccountDebtsUseCase } from '../../../domain/payment';

/** Dívidas de todos os CNPJs do parceiro (D16), sem consultar o Stripe. */
export async function listPartnerDebtsApplicationUseCase(
  ownerUid: string
): Promise<AccountDebtView[]> {
  const documents = await listOwnerSalesDocumentsUseCase(ownerUid);
  return listAccountDebtsUseCase(documents.map((document) => document.accountKey));
}
