import { debtService } from '../factory';
import type { AccountDebtView } from '../types/accountDebt';

/** Quem chama garante o papel de admin. */
export function listOpenAccountDebtsForAdminUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AccountDebtView[]; nextCursor: string | null }> {
  return debtService.listOpenForAdmin(limit, cursor);
}
