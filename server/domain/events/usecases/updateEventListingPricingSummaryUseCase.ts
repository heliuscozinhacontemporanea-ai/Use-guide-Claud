import type { ListingCardSummary } from '../../../shared/kernel/listingCardSummary';
import { eventsService } from '../factory';

/** Grátis ou pago e o "a partir de" do cartão do evento (D37 item 10), calculados pelo ticketing. */
export async function updateEventListingPricingSummaryUseCase(
  eventListingId: string,
  summary: { pricingMode: 'free' | 'paid'; cardSummary: ListingCardSummary | null }
): Promise<void> {
  return eventsService.updateListingPricingSummary(eventListingId, summary);
}
