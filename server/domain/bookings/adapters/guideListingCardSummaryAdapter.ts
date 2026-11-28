import type { ListingCardSummary } from '../../../shared/kernel/listingCardSummary';
import { setItemCardSummaryUseCase } from '../../guide';
import type { ListingCardSummaryPort } from '../ports/listingCardSummaryPort';

export class GuideListingCardSummaryAdapter implements ListingCardSummaryPort {
  setItemCardSummary(guideItemId: string, summary: ListingCardSummary | null): Promise<void> {
    return setItemCardSummaryUseCase(guideItemId, summary);
  }
}
