import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../../events';
import {
  TicketTypeUnavailableError,
  TicketingDomainError,
} from '../../errors/ticketingDomainError';
import type { TicketingPort } from '../../ports/ticketingPort';
import type { EventPromoCode } from '../../types/ticketingTypes';

/** Sessão aberta para venda: evento publicado e dentro da janela de vendas. */
export async function loadOccurrenceOnSale(occurrenceId: string, nowMs: number) {
  const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
  if (!occurrence) {
    throw new TicketingDomainError('NOT_FOUND', 'Sessão do evento não encontrada.');
  }
  if (occurrence.status !== 'scheduled') {
    throw new TicketTypeUnavailableError('Esta sessão não está aberta para venda de ingressos.');
  }

  const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
  if (listing?.status !== 'published' || listing.visibility === 'private') {
    throw new TicketTypeUnavailableError('Este evento não está disponível para compras.');
  }

  if (occurrence.salesStartsAt && nowMs < new Date(occurrence.salesStartsAt).getTime()) {
    throw new TicketTypeUnavailableError('As vendas para esta sessão ainda não iniciaram.');
  }
  const effectiveEnd = occurrence.salesEndsAt || occurrence.startsAt;
  if (nowMs > new Date(effectiveEnd).getTime()) {
    throw new TicketTypeUnavailableError('O período de vendas desta sessão já encerrou.');
  }
  return { occurrence, listing };
}

/** Limite de ingressos por comprador na sessão, contando os emitidos e os reservados em pedidos abertos. */
export async function assertBuyerWithinTicketLimit(
  port: TicketingPort,
  params: { buyerUid: string; occurrenceId: string; requested: number; max: number; nowMs: number }
): Promise<void> {
  const { buyerUid, occurrenceId, nowMs } = params;
  const occurrenceTickets = await port.listTicketsByOccurrenceId(occurrenceId);
  const occurrenceOrders = await port.listOrdersByOccurrenceId(occurrenceId);
  const activeHolderTicketsCount = occurrenceTickets.filter(
    (t) =>
      t.ownerUserId === buyerUid &&
      (t.status === 'reserved' || t.status === 'issued' || t.status === 'checked_in')
  ).length;
  const activePendingOrders = occurrenceOrders.filter(
    (o) =>
      o.buyerId === buyerUid &&
      (o.status === 'pending_payment' || o.status === 'payment_processing') &&
      (!o.expiresAt || new Date(o.expiresAt).getTime() > nowMs)
  );
  let activeReservedOrderTicketsCount = 0;
  for (const pendingOrder of activePendingOrders) {
    const orderItems = await port.listOrderItemsByOrderId(pendingOrder.id);
    activeReservedOrderTicketsCount += orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
  }
  if (activeHolderTicketsCount + activeReservedOrderTicketsCount + params.requested > params.max) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      `Limite máximo de ${params.max} ingressos por usuário nesta ocorrência excedido.`
    );
  }
}

/** Cupom ativo, vigente e com usos disponíveis. */
export async function loadActivePromo(
  port: TicketingPort,
  listingId: string,
  code: string,
  nowMs: number
): Promise<EventPromoCode> {
  const promo = await port.getPromoCodeByCode(listingId, code);
  if (!promo?.isActive) {
    throw new TicketingDomainError('INVALID_ARGUMENT', 'Cupom promocional inválido ou inativo.');
  }
  if (promo.startsAt && nowMs < new Date(promo.startsAt).getTime()) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      'Cupom promocional ainda não está vigente.'
    );
  }
  if (promo.endsAt && nowMs > new Date(promo.endsAt).getTime()) {
    throw new TicketingDomainError('UNPROCESSABLE_ENTITY', 'Cupom promocional expirado.');
  }
  if (promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
    throw new TicketingDomainError('UNPROCESSABLE_ENTITY', 'Limite de uso deste cupom atingido.');
  }
  return promo;
}
