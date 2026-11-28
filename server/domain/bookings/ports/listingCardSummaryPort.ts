import type { ListingCardSummary } from '../../../shared/kernel/listingCardSummary';

/** Onde o bookings grava o "a partir de" do anúncio (D37 item 10); o anúncio é do domínio guide. */
export interface ListingCardSummaryPort {
  setItemCardSummary(guideItemId: string, summary: ListingCardSummary | null): Promise<void>;
}
