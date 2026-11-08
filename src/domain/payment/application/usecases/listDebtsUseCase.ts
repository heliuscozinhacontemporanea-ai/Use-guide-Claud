import { receivablesApiAdapter } from '../../factory';
import type { AccountDebtView } from '../../types/receivables';

export function listDebtsUseCase(): Promise<AccountDebtView[]> {
  return receivablesApiAdapter.listDebts();
}
