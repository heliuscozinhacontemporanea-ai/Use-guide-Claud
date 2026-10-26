import { type AdminSaleClaimView, listPendingSaleClaimsUseCase } from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from '../paymentAccounts/describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from '../paymentAccounts/sellerAccountSummary';

export type AdminSaleClaimQueueView = AdminSaleClaimView & SellerAccountSummary;

/** Fila de reclamações com o vendedor de cada venda; quem chama garante o papel de admin. */
export async function listAdminSaleClaimsApplicationUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminSaleClaimQueueView[]; nextCursor: string | null }> {
  const page = await listPendingSaleClaimsUseCase(limit, cursor);
  const keys = page.data.flatMap((claim) => (claim.accountKey ? [claim.accountKey] : []));
  const sellers = await describeSellerAccountsApplicationUseCase(keys);
  return {
    data: page.data.map((claim) => ({
      ...claim,
      ...sellerOf(sellers, claim.accountKey),
    })),
    nextCursor: page.nextCursor,
  };
}
