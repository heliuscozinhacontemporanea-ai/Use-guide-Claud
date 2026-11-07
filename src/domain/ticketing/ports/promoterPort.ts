import type { EventPromotersSummary, MyPromotion, PromoterEarning } from '../types/promoter';

/** Divulgadores (D27). Erros chegam como `Error(code)` para a tela traduzir (§12.5). */
export interface PromoterPort {
  getEventPromoters(eventListingId: string): Promise<EventPromotersSummary>;
  invitePromoter(eventListingId: string, username: string, earning: PromoterEarning): Promise<void>;
  endPromoter(promoterId: string): Promise<void>;
  listMyPromotions(): Promise<MyPromotion[]>;
  respondPromoterInvite(promoterId: string, accept: boolean): Promise<void>;
}
