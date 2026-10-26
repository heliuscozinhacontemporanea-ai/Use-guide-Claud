import { debtService } from '../factory';
import type { AccountDebtView } from '../types/accountDebt';

/** `accountKeys` são os CNPJs do parceiro logado; quem chama confere que a prova é dele. */
export function declareForceMajeureUseCase(
  debtId: string,
  accountKeys: string[],
  declaration: { reason: string; proofPath: string; declaredBy: string }
): Promise<AccountDebtView> {
  return debtService.declareForceMajeure(debtId, accountKeys, declaration);
}
