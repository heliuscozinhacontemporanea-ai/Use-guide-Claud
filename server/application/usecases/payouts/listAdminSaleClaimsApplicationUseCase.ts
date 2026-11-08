import { getBookingUseCase } from '../../../domain/bookings';
import { type AdminSaleClaimView, listPendingSaleClaimsUseCase } from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from '../paymentAccounts/describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from '../paymentAccounts/sellerAccountSummary';
import { type BookingServiceEvidence, toBookingServiceEvidence } from './bookingServiceEvidence';

export type AdminSaleClaimQueueView = AdminSaleClaimView &
  SellerAccountSummary & { serviceEvidence?: BookingServiceEvidence };

/**
 * Fila de reclamações com o vendedor de cada venda e, nas reservas, as provas do serviço: check-in,
 * "Cheguei" com localização, relato de ausência e resposta do comprador (D20). Quem chama garante o
 * papel de admin.
 */
export async function listAdminSaleClaimsApplicationUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminSaleClaimQueueView[]; nextCursor: string | null }> {
  const page = await listPendingSaleClaimsUseCase(limit, cursor);
  const keys = page.data.flatMap((claim) => (claim.accountKey ? [claim.accountKey] : []));
  const [sellers, bookings] = await Promise.all([
    describeSellerAccountsApplicationUseCase(keys),
    Promise.all(
      page.data.map((claim) =>
        claim.referenceType === 'booking' ? getBookingUseCase(claim.referenceId) : null
      )
    ),
  ]);
  return {
    data: page.data.map((claim, index) => {
      const booking = bookings[index];
      return {
        ...claim,
        ...sellerOf(sellers, claim.accountKey),
        ...(booking ? { serviceEvidence: toBookingServiceEvidence(booking) } : {}),
      };
    }),
    nextCursor: page.nextCursor,
  };
}
