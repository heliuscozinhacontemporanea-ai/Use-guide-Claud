import { type AccountDebtView, listOpenAccountDebtsForAdminUseCase } from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from './describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from './sellerAccountSummary';

export type AdminAccountDebtView = AccountDebtView & SellerAccountSummary;

/** Dívidas em aberto com o vendedor de cada uma; quem chama garante o papel de admin. */
export async function listAdminAccountDebtsApplicationUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminAccountDebtView[]; nextCursor: string | null }> {
  const page = await listOpenAccountDebtsForAdminUseCase(limit, cursor);
  const sellers = await describeSellerAccountsApplicationUseCase(
    page.data.map((debt) => debt.accountKey)
  );
  return {
    data: page.data.map((debt) => ({ ...debt, ...sellerOf(sellers, debt.accountKey) })),
    nextCursor: page.nextCursor,
  };
}
