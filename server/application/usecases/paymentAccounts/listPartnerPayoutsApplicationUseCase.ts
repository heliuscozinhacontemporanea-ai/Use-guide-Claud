import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import {
  listPayoutEntriesUseCase,
  PaymentDomainError,
  type PayoutEntryView,
} from '../../../domain/payment';

/** Extrato por venda dos CNPJs do parceiro (D14); filtrar por um CNPJ de outra pessoa responde 404. */
export async function listPartnerPayoutsApplicationUseCase(
  ownerUid: string,
  query: { accountKey?: string; limit: number; cursor?: string }
): Promise<{ data: PayoutEntryView[]; nextCursor: string | null }> {
  const keys = (await listOwnerSalesDocumentsUseCase(ownerUid)).map(
    (document) => document.accountKey
  );
  if (query.accountKey && !keys.includes(query.accountKey)) {
    throw new PaymentDomainError('NOT_FOUND', 'Conta de recebimento não encontrada.', 404);
  }
  return listPayoutEntriesUseCase(
    query.accountKey ? [query.accountKey] : keys,
    query.limit,
    query.cursor
  );
}
