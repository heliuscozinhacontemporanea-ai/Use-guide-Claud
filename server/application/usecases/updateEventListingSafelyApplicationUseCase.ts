import {
  updateEventListingUseCase,
  type EventListing,
  type UpdateEventListingInput,
} from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { hasEventCommercialHistoryApplicationUseCase } from './hasEventCommercialHistoryApplicationUseCase';

export async function updateEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  input: UpdateEventListingInput
): Promise<EventListing> {
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  );
  return updateEventListingUseCase(actor, eventListingId, input, { hasCommercialHistory });
}
