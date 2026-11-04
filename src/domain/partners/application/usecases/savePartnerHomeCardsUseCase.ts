import { partnerHomeAdapter } from '../../factory';

export function savePartnerHomeCardsUseCase(cards: string[]): Promise<string[]> {
  return partnerHomeAdapter.saveCards(cards);
}
