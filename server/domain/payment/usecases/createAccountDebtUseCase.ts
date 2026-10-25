import { debtService } from '../factory';
import type { CreateDebtInput } from '../services/debtService';
import type { AccountDebt } from '../types/accountDebt';

/** Cria a dívida do CNPJ (multa, contestação ou reembolso depois do repasse); repetir não duplica. */
export function createAccountDebtUseCase(input: CreateDebtInput): Promise<AccountDebt | null> {
  return debtService.createDebt(input);
}
