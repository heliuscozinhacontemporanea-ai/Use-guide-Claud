import { debtService } from '../factory';

/** `accountKeys` são os CNPJs do parceiro logado: dívida de outro CNPJ responde 404. */
export function startAccountDebtPaymentUseCase(
  debtId: string,
  accountKeys: string[]
): Promise<{ clientSecret: string }> {
  return debtService.startPayment(debtId, accountKeys);
}
