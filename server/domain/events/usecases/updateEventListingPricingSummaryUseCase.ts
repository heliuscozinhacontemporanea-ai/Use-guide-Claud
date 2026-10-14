import { eventsService } from '../factory';

export async function updateEventListingPricingSummaryUseCase(
  eventListingId: string,
  summary: { pricingMode: 'free' | 'paid'; startingPriceMinor?: number }
): Promise<void> {
  return eventsService.updateListingPricingSummary(eventListingId, summary);
}
