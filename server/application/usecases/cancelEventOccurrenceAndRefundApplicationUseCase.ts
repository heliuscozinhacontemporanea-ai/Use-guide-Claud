import { cancelEventOccurrenceUseCase, type EventOccurrence } from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  type Refund,
  type TicketingActorContext,
} from '../../domain/ticketing';
import { chargeCancellationPenaltyApplicationUseCase } from './payouts/chargeCancellationPenaltyApplicationUseCase';
import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';

export async function cancelEventOccurrenceAndRefundApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  reason = 'Sessão cancelada pela organização.'
): Promise<{
  occurrence: EventOccurrence;
  refundsInitiated: Refund[];
}> {
  const occurrence = await cancelEventOccurrenceUseCase(actor, occurrenceId, reason);
  const allOrders = await listEventOrdersForPartnerOrAdminUseCase(actor, occurrence.eventListingId);
  const eligibleOrders = allOrders.filter(
    (order) =>
      order.occurrenceId === occurrenceId &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  );

  // Cancelamento pelo proprietário paga multa (D14); antes dos reembolsos, que reduzem o valor vendido.
  // Admin cancelando (ex.: fraude) não gera multa automática.
  if (actor.admin !== true && eligibleOrders.length > 0) {
    await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'event_occurrence',
      referenceId: occurrenceId,
      sales: eligibleOrders.map((order) => ({
        referenceType: 'ticket_order',
        referenceId: order.id,
      })),
    });
  }

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
        recipientUid: order.buyerId,
        type: 'event_canceled',
        params: { event: order.eventSnapshot?.title || '' },
        link: { screen: 'purchases' },
        dedupeKey: `event_canceled_${occurrence.id}_${order.id}`,
      }).catch(() => {});
    } catch {
      // Continua processando demais pedidos elegíveis
    }
  }

  return { occurrence, refundsInitiated };
}
