import { saleClaimService } from '../factory';
import type { AdminSaleClaimView } from '../types/saleClaim';

/** Fila do admin; quem chama garante o papel de admin. */
export function listPendingSaleClaimsUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminSaleClaimView[]; nextCursor: string | null }> {
  return saleClaimService.listPendingForAdmin(limit, cursor);
}
