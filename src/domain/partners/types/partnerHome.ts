/** Início do painel (D27), como a rota `/api/partner-home` devolve. Textos ficam no i18n. */
export type PartnerAttentionKind =
  | 'provider_absence'
  | 'sale_claim'
  | 'debt'
  | 'payment_account'
  | 'verification_rejected'
  | 'plan_expiring';

export interface PartnerAttentionItem {
  kind: PartnerAttentionKind;
  refId: string;
  establishmentIds: string[];
  title: string | null;
  deadline: string | null;
  amountMinor?: number;
}

export interface PartnerTodayItem {
  kind: 'slot' | 'session';
  id: string;
  parentId: string;
  establishmentIds: string[];
  title: string;
  offerKind?: string;
  startsAt: string;
  endsAt: string | null;
  sold: number;
  capacity: number;
  checkedIn: number | null;
  arrivedAt: string | null;
}

export interface PartnerEstablishment {
  id: string;
  name: string;
  category: string;
}

export interface PartnerHomeView {
  establishments: PartnerEstablishment[];
  attention: PartnerAttentionItem[];
  today: PartnerTodayItem[];
  numbers: {
    salesTodayMinor: number;
    salesTodayCount: number;
    nextPayout: { releaseAt: string; amountMinor: number; count: number } | null;
  };
}
