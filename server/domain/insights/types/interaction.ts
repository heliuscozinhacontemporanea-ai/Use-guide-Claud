export type InteractionType = 'view' | 'whatsapp_click' | 'share' | 'favorite';

export interface InteractionHistoryItem {
  date: string;
  views: number;
}

export interface ItemStats {
  views: number;
  whatsapp_click: number;
  share: number;
  favorite: number;
  history: InteractionHistoryItem[];
}
