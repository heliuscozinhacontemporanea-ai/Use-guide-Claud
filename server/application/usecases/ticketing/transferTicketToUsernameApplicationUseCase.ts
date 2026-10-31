import { createNotificationUseCase } from '../../../domain/notifications';
import { type TicketingActorContext, transferTicketUseCase } from '../../../domain/ticketing';
import { getUserProfileUseCase, resolveUsernameOwnerUseCase } from '../../../domain/users';

export type TicketTransferErrorCode = 'TRANSFER_TO_SELF' | 'RECIPIENT_NOT_VERIFIED';

export class TicketTransferError extends Error {
  constructor(
    public readonly code: TicketTransferErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'TicketTransferError';
  }
}

/**
 * Transfere o ingresso para a conta dona do @ (D21): só para outra conta, com e-mail verificado.
 * O e-mail do destinatário vem da conta, nunca do cliente (§7.3), e não volta na resposta.
 */
export async function transferTicketToUsernameApplicationUseCase(
  actor: TicketingActorContext,
  ticketId: string,
  username: string
): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }> {
  const recipient = await resolveUsernameOwnerUseCase(username);
  if (recipient.uid === actor.uid) {
    throw new TicketTransferError('TRANSFER_TO_SELF', 'O ingresso já é seu.');
  }
  if (!recipient.emailVerified) {
    throw new TicketTransferError(
      'RECIPIENT_NOT_VERIFIED',
      'Esta conta ainda não confirmou o e-mail e não pode receber ingressos.'
    );
  }
  // O destinatário vê de quem recebeu e só pode devolver para essa pessoa (D21).
  const sender = await getUserProfileUseCase(actor.uid);
  const senderName = `${sender?.firstName ?? ''} ${sender?.lastName ?? ''}`.trim();
  const { newTicket } = await transferTicketUseCase(actor, {
    ticketId,
    toUserId: recipient.uid,
    recipientEmail: recipient.email,
    recipientName: recipient.displayName ?? recipient.username,
    receivedFrom: { username: sender?.username ?? null, displayName: senderName || null },
  });
  // Aviso não pode desfazer a transferência já gravada.
  await createNotificationUseCase({
    recipientPartnerId: recipient.uid,
    type: 'admin_message',
    title: 'Você recebeu um ingresso',
    message: newTicket.eventSnapshot?.title
      ? `Um ingresso para ${newTicket.eventSnapshot.title} está na sua carteira.`
      : 'Um ingresso está na sua carteira.',
  }).catch(() => undefined);
  return {
    ticketId: newTicket.id,
    recipient: { username: recipient.username, displayName: recipient.displayName },
  };
}
