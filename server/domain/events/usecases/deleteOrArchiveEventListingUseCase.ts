import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';

export async function deleteOrArchiveEventListingUseCase(
  actor: EventActorContext,
  id: string,
  hasCommercialHistory = false
): Promise<{ mode: 'deleted' | 'archived' }> {
  return eventsService.deleteOrArchiveListing(actor, id, hasCommercialHistory);
}
