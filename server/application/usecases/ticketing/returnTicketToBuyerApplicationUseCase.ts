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
    recipientPartnerId: newTicket.ownerUserId,
    type: 'admin_message',
    title: 'Ingresso devolvido',
    message: newTicket.eventSnapshot?.title
      ? `O ingresso para ${newTicket.eventSnapshot.title} voltou para a sua carteira.`
      : 'Um ingresso voltou para a sua carteira.',
  }).catch(() => undefined);
  return { ticketId: newTicket.id };
}
