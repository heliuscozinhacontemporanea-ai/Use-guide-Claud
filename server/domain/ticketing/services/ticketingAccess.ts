import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';

export interface TicketingActorContext {
  uid: string;
  admin?: boolean;
  role?: string;
  /** Do token verificado; só a compra exige (AGENTS.md §7.10, A07). */
  emailVerified?: boolean;
}

export function isActorAdmin(actor: TicketingActorContext): boolean {
  return actor.admin === true;
}

export function getAuditActorType(
  actor: TicketingActorContext,
  listingOwnerId?: string
): 'admin' | 'partner' | 'user' {
  if (isActorAdmin(actor)) return 'admin';
  if (listingOwnerId && actor.uid === listingOwnerId) return 'partner';
  return 'user';
}

/** Só o dono do evento (ou o admin) gerencia ingressos de uma sessão. */
export async function assertCanManageOccurrence(
  actor: TicketingActorContext,
  occurrenceId: string
) {
  const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
  if (!occurrence) {
    throw new TicketingDomainError('NOT_FOUND', 'Ocorrência do evento não encontrada.');
  }
  const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
  if (!listing) {
    throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
  }
  if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
    throw new TicketingDomainError(
      'FORBIDDEN',
      'Sem permissão para gerenciar os ingressos deste evento.'
    );
  }
  return { occurrence, listing };
}
