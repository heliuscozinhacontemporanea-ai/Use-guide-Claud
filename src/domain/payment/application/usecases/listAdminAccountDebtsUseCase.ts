import { adminFinanceApiAdapter } from '../../factory';
import type { AdminAccountDebt, AdminPage } from '../../types/adminFinance';

export function listAdminAccountDebtsUseCase(
  cursor?: string
): Promise<AdminPage<AdminAccountDebt>> {
  return adminFinanceApiAdapter.listAccountDebts(cursor);
}
