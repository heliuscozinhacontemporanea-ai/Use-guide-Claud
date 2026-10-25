import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventSalesAnalytics } from '../types/ticketingTypes';

export async function getEventSalesAnalyticsUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  occurrenceId?: string
): Promise<EventSalesAnalytics> {
  return ticketingReportService.getEventSalesAnalytics(actor, eventListingId, occurrenceId);
}
