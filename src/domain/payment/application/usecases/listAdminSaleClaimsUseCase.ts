import { adminFinanceApiAdapter } from '../../factory';
import type { AdminPage, AdminSaleClaim } from '../../types/adminFinance';

export function listAdminSaleClaimsUseCase(cursor?: string): Promise<AdminPage<AdminSaleClaim>> {
  return adminFinanceApiAdapter.listSaleClaims(cursor);
}
