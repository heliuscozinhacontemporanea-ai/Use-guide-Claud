import {
  getEventListingByIdUseCase,
  postponeEventOccurrenceUseCase,
  type EventOccurrence,
} from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  moveOrderToOccurrenceUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

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
