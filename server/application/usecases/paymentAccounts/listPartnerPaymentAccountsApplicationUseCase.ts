import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { listOwnerPaymentAccountsUseCase, type PaymentAccountView } from '../../../domain/payment';

export interface PartnerPaymentAccount {
  accountKey: string;
  maskedDocument: string;
  itemIds: string[];
  /** `null` enquanto o parceiro não começou o cadastro no Stripe deste CNPJ. */
  account: PaymentAccountView | null;
}

/** Um cartão por CNPJ aprovado do parceiro, com a conta Stripe dele quando já existe (D14). */
export async function listPartnerPaymentAccountsApplicationUseCase(
  ownerUid: string
): Promise<PartnerPaymentAccount[]> {
  const [documents, accounts] = await Promise.all([
    listOwnerSalesDocumentsUseCase(ownerUid),
    listOwnerPaymentAccountsUseCase(ownerUid),
  ]);
  const byKey = new Map(accounts.map((account) => [account.accountKey, account]));
  return documents.map((document) => ({
    accountKey: document.accountKey,
    maskedDocument: document.maskedDocument,
    itemIds: document.itemIds,
    account: byKey.get(document.accountKey) ?? null,
  }));
}
