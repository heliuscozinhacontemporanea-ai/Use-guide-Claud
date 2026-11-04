export type InteractionType = 'view' | 'whatsapp_click' | 'share' | 'favorite';

export interface InteractionHistoryItem {
  date: string;
  views: number;
}

export interface ItemStats {
  /** Todas as visualizações; a divisão abaixo separa quem estava logado dos visitantes. */
  views: number;
  viewsSignedIn: number;
  viewsAnonymous: number;
  whatsapp_click: number;
  share: number;
  favorite: number;
  history: InteractionHistoryItem[];
  /** Visitas do mês atual e do anterior, no fuso do negócio (p19). */
  month: { currentViews: number; previousViews: number };
}
