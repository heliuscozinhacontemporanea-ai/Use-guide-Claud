import { ticketingAdapter } from '../../factory';

export function getEventSalesAnalyticsUseCase(
  eventListingId: string,
  occurrenceId?: string,
  asAdmin = false
) {
  return ticketingAdapter.getEventSalesAnalytics(eventListingId, occurrenceId, asAdmin);
}
