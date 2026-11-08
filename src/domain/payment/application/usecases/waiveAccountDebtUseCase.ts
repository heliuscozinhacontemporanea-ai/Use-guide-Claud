import { adminFinanceApiAdapter } from '../../factory';

export function waiveAccountDebtUseCase(debtId: string): Promise<void> {
  return adminFinanceApiAdapter.waiveAccountDebt(debtId);
}
