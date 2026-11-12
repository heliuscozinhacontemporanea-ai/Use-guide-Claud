import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { isActiveGateStaffUseCase, wasGateStaffAtUseCase } from '../../gateStaff';
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

// A equipe da portaria perde o acesso 6 h depois do fim da sessão, como o código do ingresso (D20).
const GATE_STAFF_GRACE_MS = 6 * 60 * 60 * 1000;

async function loadOccurrence(occurrenceId: string) {
  const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
  if (!occurrence) {
    throw new TicketingDomainError('NOT_FOUND', 'Ocorrência do evento não encontrada.');
  }
  const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
  if (!listing) throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
  return { occurrence, listing };
}

const GATE_FORBIDDEN = 'Sem permissão para operar a portaria deste evento.';

/**
 * Portaria da sessão (C1): o dono, o admin ou alguém da equipe ativa do evento. A equipe só libera
 * entradas, baixa a lista e vê a contagem; nada de vendas, cortesias ou edição, que continuam em
 * `assertCanManageOccurrence`. Conferido a cada leitura: remover a pessoa vale na seguinte.
 */
export async function assertCanOperateGate(
  actor: TicketingActorContext,
  occurrenceId: string,
  nowMs: number = Date.now()
) {
  const { occurrence, listing } = await loadOccurrence(occurrenceId);
  if (isActorAdmin(actor) || listing.ownerId === actor.uid) {
    return { occurrence, listing, staff: false };
  }
  const endMs = new Date(occurrence.endsAt || occurrence.startsAt).getTime();
  const active =
    nowMs <= endMs + GATE_STAFF_GRACE_MS &&
    (await isActiveGateStaffUseCase({ type: 'event', id: listing.id }, actor.uid));
  if (!active) throw new TicketingDomainError('FORBIDDEN', GATE_FORBIDDEN);
  return { occurrence, listing, staff: true };
}

/**
 * Envio das entradas lidas sem internet (C1): quem saiu da equipe ainda entrega o que leu enquanto
 * fazia parte dela. `accepts` diz quais leituras valem; `staff` avisa que é preciso filtrar.
 */
export async function resolveGateSync(actor: TicketingActorContext, occurrenceId: string) {
  const { occurrence, listing } = await loadOccurrence(occurrenceId);
  if (isActorAdmin(actor) || listing.ownerId === actor.uid) {
    return { occurrence, listing, staff: false, accepts: async (_scannedAt: string) => true };
  }
  const scope = { type: 'event' as const, id: listing.id };
  return {
    occurrence,
    listing,
    staff: true,
    accepts: (scannedAt: string) => wasGateStaffAtUseCase(scope, actor.uid, scannedAt),
  };
}

export function gateForbidden(): TicketingDomainError {
  return new TicketingDomainError('FORBIDDEN', GATE_FORBIDDEN);
}
