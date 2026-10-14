import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventSalesAnalytics } from '../types/ticketingTypes';

export async function getEventSalesAnalyticsUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  occurrenceId?: string
): Promise<EventSalesAnalytics> {
  return ticketingService.getEventSalesAnalytics(actor, eventListingId, occurrenceId);
}
