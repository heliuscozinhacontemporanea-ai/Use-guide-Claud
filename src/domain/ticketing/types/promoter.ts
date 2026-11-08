/** Divulgadores (D27), como a API devolve. */
export type PromoterEarning =
  | { type: 'commission'; basisPoints: number }
  | { type: 'per_ticket'; amountMinor: number }
  | { type: 'flat_fee'; amountMinor: number };

export type PromoterStatus = 'invited' | 'active' | 'declined' | 'ended';

export interface PromoterTotals {
  tickets: number;
  soldMinor: number;
  owedMinor: number;
}

export interface PromoterRow extends PromoterTotals {
  id: string;
  eventListingId: string;
  promoter: { username: string | null; displayName: string | null };
  code: string;
  earning: PromoterEarning;
  status: PromoterStatus;
  createdAt: string;
}

export interface EventPromotersSummary extends PromoterTotals {
  rows: PromoterRow[];
}

/** Uma linha de Divulgação (p26). */
export interface MyPromotion extends PromoterTotals {
  id: string;
  eventListingId: string;
  code: string;
  earning: PromoterEarning;
  status: PromoterStatus;
  createdAt: string;
  username: string | null;
  eventTitle: string;
  businessName: string | null;
  startsAt: string | null;
}
