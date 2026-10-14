import { eventsService } from '../factory';
import type { EventRatingSummary } from '../types/eventTypes';

export async function updateEventRatingSummaryUseCase(
  eventListingId: string,
  summary: EventRatingSummary
): Promise<void> {
  return eventsService.updateRatingSummary(eventListingId, summary);
}
