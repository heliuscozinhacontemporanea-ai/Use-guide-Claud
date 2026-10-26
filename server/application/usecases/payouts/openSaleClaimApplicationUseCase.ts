import { getBookingUseCase } from '../../../domain/bookings';
import { getEventListingByIdUseCase } from '../../../domain/events';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  type BuyerSaleClaimView,
  openSaleClaimUseCase,
  PaymentDomainError,
  type SaleClaimReason,
} from '../../../domain/payment';
import { getTicketOrderUseCase } from '../../../domain/ticketing';
import type { OrchestrationActor } from '../orchestrationActor';

export interface OpenSaleClaimRequest {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  reason: SaleClaimReason;
  details?: string;
}

interface ClaimedSale {
  startsAt: string;
  endsAt: string;
  sellerPartnerId?: string;
}

const NOT_FOUND = () => new PaymentDomainError('NOT_FOUND', 'Compra não encontrada.', 404);

async function ticketSale(actor: OrchestrationActor, orderId: string): Promise<ClaimedSale> {
  const found = await getTicketOrderUseCase(actor, orderId).catch(() => null);
  const order = found?.order;
  // Só o comprador reclama; pedido de outra pessoa responde como inexistente (AGENTS.md §7.10).
  if (!order || order.buyerId !== actor.uid || !order.eventSnapshot) throw NOT_FOUND();
  if (order.status !== 'paid' && order.status !== 'partially_refunded') {
    throw new PaymentDomainError('CLAIM_NOT_ALLOWED', 'Esta compra não tem valor a reclamar.', 422);
  }
  const listing = await getEventListingByIdUseCase(order.eventListingId);
  return {
    startsAt: order.eventSnapshot.startsAt,
    endsAt: order.eventSnapshot.endsAt || order.eventSnapshot.startsAt,
    sellerPartnerId: listing?.ownerId,
  };
}

async function bookingSale(actor: OrchestrationActor, bookingId: string): Promise<ClaimedSale> {
  const booking = await getBookingUseCase(bookingId);
  if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
  // `no_show` entra: o comprador pode contestar a falta que o parceiro marcou.
  if (!['confirmed', 'completed', 'no_show'].includes(booking.status)) {
    throw new PaymentDomainError('CLAIM_NOT_ALLOWED', 'Esta compra não tem valor a reclamar.', 422);
  }
  const { startsAt, durationMinutes } = booking.offerSnapshot;
  return {
    startsAt,
    endsAt: new Date(new Date(startsAt).getTime() + (durationMinutes ?? 0) * 60_000).toISOString(),
    sellerPartnerId: booking.sellerPartnerId,
  };
}

/** O comprador relata um problema na venda (D16, 2A); o repasse fica retido até a decisão do admin. */
export async function openSaleClaimApplicationUseCase(
  actor: OrchestrationActor,
  request: OpenSaleClaimRequest
): Promise<BuyerSaleClaimView> {
  const sale =
    request.referenceType === 'ticket_order'
      ? await ticketSale(actor, request.referenceId)
      : await bookingSale(actor, request.referenceId);
  const claim = await openSaleClaimUseCase({
    referenceType: request.referenceType,
    referenceId: request.referenceId,
    buyerUid: actor.uid,
    reason: request.reason,
    ...(request.details ? { details: request.details } : {}),
    serviceStartsAt: sale.startsAt,
    serviceEndsAt: sale.endsAt,
  });
  if (sale.sellerPartnerId) {
    // Sem o texto do comprador: o parceiro vê só que o repasse desta venda está em análise.
    await createNotificationUseCase({
      recipientPartnerId: sale.sellerPartnerId,
      type: 'admin_message',
      title: 'Reclamação em análise',
      message:
        'Um comprador relatou um problema. O repasse desta venda fica retido até a decisão, em até 5 dias.',
    }).catch(() => undefined);
  }
  return {
    id: claim.id,
    referenceType: claim.referenceType,
    referenceId: claim.referenceId,
    reason: claim.reason,
    status: claim.status,
    openedAt: claim.openedAt,
    decideBy: claim.decideBy,
  };
}
