import { deleteOrArchiveEventListingUseCase } from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { hasEventCommercialHistoryApplicationUseCase } from './hasEventCommercialHistoryApplicationUseCase';
import { cancelEventListingAndRefundApplicationUseCase } from './cancelEventListingAndRefundApplicationUseCase';

export async function deleteEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  );
  if (hasCommercialHistory) {
    await cancelEventListingAndRefundApplicationUseCase(
      actor,
      eventListingId,
      'Evento encerrado/arquivado com histórico comercial.'
    );
  }
  return deleteOrArchiveEventListingUseCase(actor, eventListingId, hasCommercialHistory);
}
