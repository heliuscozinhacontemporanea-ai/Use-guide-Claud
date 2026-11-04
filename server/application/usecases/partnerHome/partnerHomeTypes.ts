/** Leitura do Início do painel do parceiro (D27). Textos ficam no app; aqui só tipo, ids e valores. */
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
  /** Estabelecimentos a que o item pertence; vazio quando não há como saber. */
  establishmentIds: string[];
  title: string | null;
  deadline: string | null;
  amountMinor?: number;
}

export interface PartnerTodayItem {
  kind: 'slot' | 'session';
  id: string;
  /** Oferta (horário) ou evento (sessão). */
  parentId: string;
  establishmentIds: string[];
  title: string;
  offerKind?: string;
  startsAt: string;
  endsAt: string | null;
  sold: number;
  capacity: number;
  /** Só nos horários de reserva; nas sessões a portaria tem a própria contagem. */
  checkedIn: number | null;
  arrivedAt: string | null;
}

export interface PartnerHomeView {
  establishments: Array<{ id: string; name: string; category: string }>;
  attention: PartnerAttentionItem[];
  today: PartnerTodayItem[];
  numbers: {
    salesTodayMinor: number;
    salesTodayCount: number;
    nextPayout: { releaseAt: string; amountMinor: number; count: number } | null;
  };
}
