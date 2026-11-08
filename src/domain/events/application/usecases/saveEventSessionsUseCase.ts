import type { EventSessionDraft, EventSessionsScope } from '../../types/eventSession';
import { planEventSessionChanges } from '../../utils/eventSessions';
import { createAdminEventOccurrenceUseCase } from './createAdminEventOccurrenceUseCase';
import { createPartnerEventOccurrenceUseCase } from './createPartnerEventOccurrenceUseCase';
import { deleteAdminEventOccurrenceUseCase } from './deleteAdminEventOccurrenceUseCase';
import { deletePartnerEventOccurrenceUseCase } from './deletePartnerEventOccurrenceUseCase';
import { updateAdminEventOccurrenceUseCase } from './updateAdminEventOccurrenceUseCase';
import { updatePartnerEventOccurrenceUseCase } from './updatePartnerEventOccurrenceUseCase';

export interface SaveEventSessionsInput {
  eventListingId: string;
  scope: EventSessionsScope;
  /** IDs das sessões que existiam quando o editor abriu. */
  savedIds: string[];
  sessions: EventSessionDraft[];
}

/**
 * Grava as sessões editadas de um evento já criado. Cria e altera antes de apagar, para o evento
 * nunca ficar sem sessão no meio da gravação; o servidor recusa apagar sessão com ingressos vendidos.
 */
export async function saveEventSessionsUseCase({
  eventListingId,
  scope,
  savedIds,
  sessions,
}: SaveEventSessionsInput): Promise<void> {
  const { toCreate, toUpdate, toDeleteIds } = planEventSessionChanges(savedIds, sessions);
  const create =
    scope === 'admin' ? createAdminEventOccurrenceUseCase : createPartnerEventOccurrenceUseCase;
  const update =
    scope === 'admin' ? updateAdminEventOccurrenceUseCase : updatePartnerEventOccurrenceUseCase;
  const remove =
    scope === 'admin' ? deleteAdminEventOccurrenceUseCase : deletePartnerEventOccurrenceUseCase;

  for (const session of toCreate) {
    await create(eventListingId, {
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      capacity: session.capacity,
      ...(session.salesEndsAt ? { salesEndsAt: session.salesEndsAt } : {}),
    });
  }
  for (const session of toUpdate) {
    await update(eventListingId, session.id, {
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      capacity: session.capacity,
      ...(session.salesEndsAt ? { salesEndsAt: session.salesEndsAt } : {}),
    });
  }
  for (const id of toDeleteIds) {
    await remove(eventListingId, id);
  }
}
