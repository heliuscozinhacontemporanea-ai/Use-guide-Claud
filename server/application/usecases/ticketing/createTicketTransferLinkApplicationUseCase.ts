import {
  createTicketTransferLinkUseCase,
  type TicketingActorContext,
} from '../../../domain/ticketing';
import { getUserProfileUseCase } from '../../../domain/users';

/** Link de transferência (D21): grava de quem é o ingresso (@ e nome) para quem abrir o link ver. */
export async function createTicketTransferLinkApplicationUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{ linkId: string; token: string; expiresAt: string }> {
  const sender = await getUserProfileUseCase(actor.uid);
  const senderName = `${sender?.firstName ?? ''} ${sender?.lastName ?? ''}`.trim();
  return createTicketTransferLinkUseCase(actor, ticketId, {
    username: sender?.username ?? null,
    displayName: senderName || null,
  });
}
