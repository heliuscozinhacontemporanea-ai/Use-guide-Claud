import type { ListingCardSummary } from '../../../shared/kernel/listingCardSummary';
import { guideService } from '../factory';

/** Grava o "a partir de" do cartão do anúncio (D37 item 10); quem calcula é o dono das ofertas. */
export async function setItemCardSummaryUseCase(
  itemId: string,
  summary: ListingCardSummary | null
): Promise<void> {
  await guideService.setItemCardSummary(itemId, summary);
}
