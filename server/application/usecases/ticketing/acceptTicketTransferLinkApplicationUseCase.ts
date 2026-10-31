import { createNotificationUseCase } from '../../../domain/notifications';
import {
  claimTicketTransferLinkUseCase,
  releaseTicketTransferLinkUseCase,
  transferTicketUseCase,
} from '../../../domain/ticketing';
import { getUserProfileUseCase } from '../../../domain/users';
import { TicketTransferError } from './transferTicketToUsernameApplicationUseCase';

/**
 * Aceite do link (D21): conta com e-mail verificado reserva o link e recebe o ingresso. Se a
 * transferência falhar (prazo, ingresso usado), o link volta a valer até vencer.
 */
export async function acceptTicketTransferLinkApplicationUseCase(
  actor: { uid: string; emailVerified: boolean },
  linkId: string,
  token: string
): Promise<{ ticketId: string }> {
  if (!actor.emailVerified) {
    throw new TicketTransferError(
      'RECIPIENT_NOT_VERIFIED',
      'Confirme seu e-mail para receber o ingresso.'
    );
  }
  const link = await claimTicketTransferLinkUseCase(linkId, token, actor.uid);
  try {
    const recipient = await getUserProfileUseCase(actor.uid);
    const recipientName = `${recipient?.firstName ?? ''} ${recipient?.lastName ?? ''}`.trim();
    const { newTicket } = await transferTicketUseCase(
      { uid: link.fromUserId, admin: false },
      {
        ticketId: link.ticketId,
        toUserId: actor.uid,
        recipientEmail: recipient?.email ?? '',
        recipientName: recipientName || recipient?.username || undefined,
        receivedFrom: link.receivedFrom,
      }
    );
    await createNotificationUseCase({
      recipientPartnerId: link.fromUserId,
      type: 'admin_message',
      title: 'Ingresso entregue',
      message: recipient?.username
        ? `@${recipient.username} aceitou o ingresso que você enviou por link.`
        : 'O ingresso que você enviou por link foi aceito.',
    }).catch(() => undefined);
    return { ticketId: newTicket.id };
  } catch (error) {
    await releaseTicketTransferLinkUseCase(link.id).catch(() => undefined);
    throw error;
  }
}
