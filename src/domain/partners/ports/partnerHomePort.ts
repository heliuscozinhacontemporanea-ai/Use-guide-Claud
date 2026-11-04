import type { PartnerHomeView, PartnerTodayItem } from '../types/partnerHome';

export interface PartnerHomePort {
  get(): Promise<PartnerHomeView>;
  /** Horários e sessões do dono em [from, to). */
  getAgenda(fromIso: string, toIso: string): Promise<PartnerTodayItem[]>;
  /** Devolve os cartões gravados, na ordem. */
  saveCards(cards: string[]): Promise<string[]>;
}
