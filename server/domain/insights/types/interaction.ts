export type InteractionType = 'view' | 'whatsapp_click' | 'share' | 'favorite';

export interface InteractionHistoryItem {
  date: string;
  views: number;
}

export interface ItemStats {
  /** Todas as visualizações: com e sem login (decisão de 2026-10-19). */
  views: number;
  viewsSignedIn: number;
  viewsAnonymous: number;
  whatsapp_click: number;
  share: number;
  favorite: number;
  history: InteractionHistoryItem[];
}

/** Contadores gravados por item e por dia; nenhum identifica quem visitou. */
export type InteractionCounter =
  | 'viewsSignedIn'
  | 'viewsAnonymous'
  | 'whatsapp_click'
  | 'share'
  | 'favorite';
