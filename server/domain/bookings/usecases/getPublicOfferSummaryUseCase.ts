import { getOfferService } from '../factory';

/** Menor preço publicado do item e se há vaga nos próximos 30 dias; null se o item não vende reservas. */
export async function getPublicOfferSummaryUseCase(
  guideItemId: string
): Promise<{ lowestUnitAmountMinor: number; hasAvailability: boolean } | null> {
  return getOfferService().getPublicOfferSummary(guideItemId);
}
