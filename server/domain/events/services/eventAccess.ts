import { EventDomainError, EventOwnershipError } from '../errors/eventDomainError';
import type { EventListing } from '../types/eventTypes';

export interface EventActorContext {
  uid: string;
  admin?: boolean;
  role?: string;
}

/** Só o dono do evento ou um admin altera o evento e as sessões. */
export function assertCanManageListing(actor: EventActorContext, listing: EventListing): void {
  if (actor.admin === true) {
    return;
  }
  if (!actor.uid || listing.ownerId !== actor.uid) {
    throw new EventOwnershipError();
  }
}

/** Capacidade positiva, término depois do início e vendas encerradas antes da sessão. */
export function validateOccurrenceTiming(input: {
  startsAt: string;
  endsAt: string;
  capacity: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
}): void {
  if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
    throw new EventDomainError(
      'INVALID_ARGUMENT',
      'A capacidade da ocorrência deve ser maior que zero.'
    );
  }
  const startMs = new Date(input.startsAt).getTime();
  const endMs = new Date(input.endsAt).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    throw new EventDomainError(
      'INVALID_ARGUMENT',
      'A data/hora de término deve ser posterior à data/hora de início.'
    );
  }
  if (input.salesStartsAt && input.salesEndsAt) {
    const salesStartMs = new Date(input.salesStartsAt).getTime();
    const salesEndMs = new Date(input.salesEndsAt).getTime();
    if (
      !Number.isFinite(salesStartMs) ||
      !Number.isFinite(salesEndMs) ||
      salesEndMs <= salesStartMs
    ) {
      throw new EventDomainError(
        'INVALID_ARGUMENT',
        'O encerramento das vendas deve ser posterior ao início das vendas.'
      );
    }
  }
  if (input.salesEndsAt) {
    const salesEndMs = new Date(input.salesEndsAt).getTime();
    if (!Number.isFinite(salesEndMs) || salesEndMs > startMs) {
      throw new EventDomainError(
        'INVALID_ARGUMENT',
        'O encerramento das vendas não pode ultrapassar o início da ocorrência.'
      );
    }
  }
}

/** Fim das vendas pelo app sugerido (D21): 2 h antes do início, quando o parceiro não escolhe outro. */
export const DEFAULT_SALES_END_BEFORE_START_MS = 2 * 60 * 60 * 1000;

export function defaultSalesEndsAt(startsAt: string): string {
  return new Date(new Date(startsAt).getTime() - DEFAULT_SALES_END_BEFORE_START_MS).toISOString();
}
