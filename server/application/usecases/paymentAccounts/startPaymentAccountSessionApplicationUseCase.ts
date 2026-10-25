import {
  assertPartnerTermsAcceptedUseCase,
  getOwnerSalesDocumentUseCase,
} from '../../../domain/partners';
import { createPaymentAccountSessionUseCase } from '../../../domain/payment';

/**
 * Abre o cadastro no Stripe da conta de um CNPJ do próprio parceiro. O CNPJ vem da verificação aprovada
 * (nunca do cliente) e vai pré-preenchido para o Stripe conferir que a conta é dessa empresa (D14).
 * Antes de receber, o parceiro aceita os termos da versão atual (D15).
 */
export async function startPaymentAccountSessionApplicationUseCase(
  owner: { uid: string; email: string },
  accountKey: string
): Promise<{ clientSecret: string }> {
  await assertPartnerTermsAcceptedUseCase(owner.uid);
  const companyTaxId = await getOwnerSalesDocumentUseCase(owner.uid, accountKey);
  return createPaymentAccountSessionUseCase({
    accountKey,
    ownerUid: owner.uid,
    email: owner.email,
    companyTaxId,
  });
}
