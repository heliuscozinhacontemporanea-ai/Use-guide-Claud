import { createNotificationUseCase } from '../../../domain/notifications';
import { type TicketingActorContext, transferTicketUseCase } from '../../../domain/ticketing';

/** Ingresso recebido por transferência volta para quem comprou, que recebe aviso (D21). */
export async function returnTicketToBuyerApplicationUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{ ticketId: string }> {
  const { newTicket } = await transferTicketUseCase(actor, { ticketId, returnToBuyer: true });
  // Aviso não pode desfazer a devolução já gravada.
  await createNotificationUseCase({
    recipientUid: newTicket.ownerUserId,
    type: 'ticket_returned',
    params: { event: newTicket.eventSnapshot?.title || '' },
    link: { screen: 'tickets' },
  }).catch(() => undefined);
  return { ticketId: newTicket.id };
}
