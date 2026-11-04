import type { PartnerHomeView } from '../types/partnerHome';

export interface PartnerHomePort {
  get(): Promise<PartnerHomeView>;
  /** Devolve os cartões gravados, na ordem. */
  saveCards(cards: string[]): Promise<string[]>;
}
