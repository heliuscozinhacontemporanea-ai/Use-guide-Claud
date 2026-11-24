import type { EventSessionDraft } from '../../types/eventSession';
import { planEventSessionChanges } from '../../utils/eventSessions';
import { createPartnerEventOccurrenceUseCase } from './createPartnerEventOccurrenceUseCase';
import { deletePartnerEventOccurrenceUseCase } from './deletePartnerEventOccurrenceUseCase';
import { updatePartnerEventOccurrenceUseCase } from './updatePartnerEventOccurrenceUseCase';

export interface SaveEventSessionsInput {
  eventListingId: string;
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
  savedIds,
  sessions,
}: SaveEventSessionsInput): Promise<void> {
  const { toCreate, toUpdate, toDeleteIds } = planEventSessionChanges(savedIds, sessions);
  const create = createPartnerEventOccurrenceUseCase;
  const update = updatePartnerEventOccurrenceUseCase;
  const remove = deletePartnerEventOccurrenceUseCase;

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
