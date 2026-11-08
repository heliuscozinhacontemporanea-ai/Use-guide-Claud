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
  // Na dúvida, aplica as travas de quem já vendeu (ex.: não mudar preço de lote vendido).
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  ).catch(() => true);
  return updateEventListingUseCase(actor, eventListingId, input, { hasCommercialHistory });
}
