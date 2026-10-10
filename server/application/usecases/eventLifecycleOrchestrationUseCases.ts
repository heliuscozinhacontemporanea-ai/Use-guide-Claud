import {
  archiveEventListingUseCase,
  cancelEventOccurrenceUseCase,
  deleteEventOccurrenceUseCase,
  deleteOrArchiveEventListingUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
  listEventOccurrencesUseCase,
  postponeEventOccurrenceUseCase,
  updateEventListingUseCase,
  updateEventOccurrenceUseCase,
  type EventListing,
  type EventOccurrence,
  type UpdateEventListingInput,
  type UpdateEventOccurrenceInput,
} from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  listEventCheckInsForPartnerOrAdminUseCase,
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
  listTicketTypesForManagementUseCase,
  moveOrderToOccurrenceUseCase,
  type Refund,
  type TicketingActorContext,
} from '../../domain/ticketing';
import { processTicketRefundApplicationUseCase } from './ticketingPaymentOrchestrationUseCases';

export async function getCommittedTicketsCountForOccurrenceApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<number> {
  try {
    const ticketTypes = await listTicketTypesForManagementUseCase(actor, occurrenceId);
    return ticketTypes.reduce((sum, tt) => sum + tt.soldCount + tt.reservedCount, 0);
  } catch {
    return 0;
  }
}

export async function hasEventCommercialHistoryApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<boolean> {
  try {
    const [orders, refunds, checkIns] = await Promise.all([
      listEventOrdersForPartnerOrAdminUseCase(actor, eventListingId),
      listEventRefundsForPartnerOrAdminUseCase(actor, eventListingId),
      listEventCheckInsForPartnerOrAdminUseCase(actor, eventListingId),
    ]);
    return orders.length > 0 || refunds.length > 0 || checkIns.length > 0;
  } catch {
    return false;
  }
}

export async function updateEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  input: UpdateEventListingInput
): Promise<EventListing> {
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  );
  return updateEventListingUseCase(actor, eventListingId, input, { hasCommercialHistory });
}

export async function deleteEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  );
  if (hasCommercialHistory) {
    await cancelEventListingAndRefundApplicationUseCase(
      actor,
      eventListingId,
      'Evento encerrado/arquivado com histórico comercial.'
    );
  }
  return deleteOrArchiveEventListingUseCase(actor, eventListingId, hasCommercialHistory);
}

export async function updateEventOccurrenceSafelyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  input: UpdateEventOccurrenceInput
): Promise<EventOccurrence> {
  const committedCount = await getCommittedTicketsCountForOccurrenceApplicationUseCase(
    actor,
    occurrenceId
  );
  return updateEventOccurrenceUseCase(actor, occurrenceId, input, committedCount);
}

export async function deleteEventOccurrenceSafelyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<{ mode: 'deleted' | 'canceled' }> {
  const committedCount = await getCommittedTicketsCountForOccurrenceApplicationUseCase(
    actor,
    occurrenceId
  );
  const hasCommercialHistory = committedCount > 0;
  if (hasCommercialHistory) {
    await cancelEventOccurrenceAndRefundApplicationUseCase(
      actor,
      occurrenceId,
      'Sessão cancelada por exclusão com histórico comercial.'
    );
    return { mode: 'canceled' };
  }
  return deleteEventOccurrenceUseCase(actor, occurrenceId, false);
}

export async function cancelEventOccurrenceAndRefundApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  reason = 'Sessão cancelada pela organização.'
): Promise<{
  occurrence: EventOccurrence;
  refundsInitiated: Refund[];
}> {
  const occurrence = await cancelEventOccurrenceUseCase(actor, occurrenceId, reason);
  const allOrders = await listEventOrdersForPartnerOrAdminUseCase(
    actor,
    occurrence.eventListingId
  );
  const eligibleOrders = allOrders.filter(
    (order) =>
      order.occurrenceId === occurrenceId &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  );

  const refundsInitiated: Refund[] = [];
  for (const order of eligibleOrders) {
    try {
      const { refund } = await processTicketRefundApplicationUseCase(actor, {
        orderId: order.id,
        reason,
        idempotencyKey: `cancel_occ_${occurrenceId}_ord_${order.id}`,
        isEventCanceledByOrganizer: true,
      });
      refundsInitiated.push(refund);

      await createNotificationUseCase({
        recipientPartnerId: order.buyerId,
        type: 'admin_message',
        title: 'Sessão de evento cancelada',
        message: `A sessão do evento "${order.eventSnapshot?.title || 'Evento'}" foi cancelada. Seu reembolso foi iniciado.`,
        relatedItemId: occurrence.eventListingId,
        relatedItemCollection: 'events',
      }).catch(() => {});
    } catch {
      // Continua processando demais pedidos elegíveis
    }
  }

  return { occurrence, refundsInitiated };
}

export async function cancelEventListingAndRefundApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  reason = 'Evento cancelado pela organização.'
): Promise<{
  listing: EventListing;
  canceledOccurrences: EventOccurrence[];
  refundsCount: number;
}> {
  const occurrences = await listEventOccurrencesUseCase(eventListingId);
  const canceledOccurrences: EventOccurrence[] = [];
  let refundsCount = 0;

  for (const occ of occurrences) {
    if (occ.status === 'scheduled' || occ.status === 'postponed') {
      const res = await cancelEventOccurrenceAndRefundApplicationUseCase(actor, occ.id, reason);
      canceledOccurrences.push(res.occurrence);
      refundsCount += res.refundsInitiated.length;
    }
  }

  const listing = await archiveEventListingUseCase(actor, eventListingId);
  return { listing, canceledOccurrences, refundsCount };
}

export async function postponeEventOccurrenceAndNotifyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  replacement: {
    startsAt: string;
    endsAt: string;
    salesStartsAt?: string;
    salesEndsAt?: string;
    reason: string;
    moveExistingOrders?: boolean;
  }
): Promise<{
  postponedOccurrence: EventOccurrence;
  newOccurrence: EventOccurrence;
  movedOrdersCount: number;
  movedTicketsCount: number;
}> {
  const { postponedOccurrence, newOccurrence } = await postponeEventOccurrenceUseCase(
    actor,
    occurrenceId,
    replacement
  );

  let movedOrdersCount = 0;
  let movedTicketsCount = 0;

  if (replacement.moveExistingOrders) {
    const moved = await moveOrderToOccurrenceUseCase(actor, {
      fromOccurrenceId: postponedOccurrence.id,
      toOccurrenceId: newOccurrence.id,
    });
    movedOrdersCount = moved.movedOrdersCount;
    movedTicketsCount = moved.movedTicketsCount;
  }

  const listing = await getEventListingByIdUseCase(postponedOccurrence.eventListingId);
  const allOrders = await listEventOrdersForPartnerOrAdminUseCase(
    actor,
    postponedOccurrence.eventListingId
  );
  const affectedOrders = allOrders.filter(
    (o) =>
      (o.occurrenceId === postponedOccurrence.id || o.occurrenceId === newOccurrence.id) &&
      o.status === 'paid'
  );

  for (const order of affectedOrders) {
    await createNotificationUseCase({
      recipientPartnerId: order.buyerId,
      type: 'admin_message',
      title: 'Evento reagendado',
      message: `A sessão do evento "${listing?.title || 'Evento'}" foi reagendada para ${new Date(newOccurrence.startsAt).toLocaleString('pt-BR')}. Motivo: ${replacement.reason}`,
      relatedItemId: postponedOccurrence.eventListingId,
      relatedItemCollection: 'events',
    }).catch(() => {});
  }

  return {
    postponedOccurrence,
    newOccurrence,
    movedOrdersCount,
    movedTicketsCount,
  };
}
