import {
  type EventOccurrence,
  getEventListingByIdUseCase,
  postponeEventOccurrenceUseCase,
} from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import { reschedulePayoutUseCase } from '../../domain/payment';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  moveOrderToOccurrenceUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

/**
 * Reagendamento (D16, 4A): os ingressos valem na nova data, o repasse acompanha a nova data e o
 * comprador tem 7 dias depois do aviso para pedir reembolso integral, inclusive a taxa de serviço.
 */
export async function postponeEventOccurrenceAndNotifyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  replacement: {
    startsAt: string;
    endsAt: string;
    salesStartsAt?: string;
    salesEndsAt?: string;
    reason: string;
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
  const { movedOrdersCount, movedTicketsCount } = await moveOrderToOccurrenceUseCase(actor, {
    fromOccurrenceId: postponedOccurrence.id,
    toOccurrenceId: newOccurrence.id,
  });

  const listing = await getEventListingByIdUseCase(postponedOccurrence.eventListingId);
  const allOrders = await listEventOrdersForPartnerOrAdminUseCase(
    actor,
    postponedOccurrence.eventListingId
  );
  const affectedOrders = allOrders.filter(
    (order) =>
      order.occurrenceId === newOccurrence.id &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  );

  for (const order of affectedOrders) {
    await reschedulePayoutUseCase('ticket_order', order.id, newOccurrence.endsAt);
    await createNotificationUseCase({
      recipientUid: order.buyerId,
      type: 'event_postponed',
      params: { event: listing?.title || '', startsAt: newOccurrence.startsAt },
      link: { screen: 'tickets' },
      dedupeKey: `event_postponed_${postponedOccurrence.id}_${order.id}`,
    }).catch(() => {});
  }

  return { postponedOccurrence, newOccurrence, movedOrdersCount, movedTicketsCount };
}
