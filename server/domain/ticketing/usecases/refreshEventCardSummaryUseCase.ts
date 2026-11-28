import { ticketTypeService } from '../factory';

/** Recalcula o "a partir de" do cartão do evento (D37 item 10), depois de mudar as regras de venda. */
export async function refreshEventCardSummaryUseCase(eventListingId: string): Promise<void> {
  await ticketTypeService.refreshListingPricingSummary(eventListingId);
}
