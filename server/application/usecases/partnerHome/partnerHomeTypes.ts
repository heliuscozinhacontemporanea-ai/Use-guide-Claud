import type { PromoCodesSummary } from '../../../domain/promotions';
/** Leitura do Início do painel do parceiro (D27). Textos ficam no app; aqui só tipo, ids e valores. */
export type PartnerAttentionKind =
  | 'provider_absence'
  | 'sale_claim'
  | 'debt'
  | 'payment_account'
  | 'verification_rejected'
  | 'plan_expiring'
  | 'partner_terms';

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
  /** Só nas sessões: cortesias que ocupam lugar (D27). */
  courtesies?: number;
  /** Só nos horários de reserva, para os cartões de "Agora" (D27). */
  bookings?: number;
  waitingBookings?: number;
  meetingPoint?: string | null;
  serviceEndsAt?: string;
}

/** Próxima sessão de evento, para o cartão "Próximo evento". */
export interface PartnerUpcomingSession {
  id: string;
  eventId: string;
  title: string;
  establishmentIds: string[];
  startsAt: string;
  sold: number;
  capacity: number;
  courtesies: number;
}

export interface PartnerHomePromoters {
  eventId: string;
  title: string;
  establishmentIds: string[];
  owedMinor: number;
  /** Os três que mais venderam. */
  top: Array<{ username: string | null; tickets: number; owedMinor: number }>;
}

/** Vagas de reserva de um dia (00:00 em Fortaleza) de um estabelecimento, nos próximos 7 dias. */
export interface PartnerWeekDay {
  date: string;
  establishmentIds: string[];
  sold: number;
  capacity: number;
}

export interface PartnerHomeView {
  /** Cartões do Início, na ordem que o parceiro escolheu (ou o padrão). */
  cards: string[];
  establishments: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    rating: number;
    reviewCount: number;
    /** Avaliações ainda sem resposta do estabelecimento. */
    unansweredReviews: number;
  }>;
  attention: PartnerAttentionItem[];
  today: PartnerTodayItem[];
  /** Horários de ontem a amanhã e sessões até amanhã, para os cartões de "Agora" (D27). */
  agora: PartnerTodayItem[];
  numbers: {
    salesTodayMinor: number;
    salesTodayCount: number;
    /** `accounts`: CNPJs que recebem nesse dia. */
    nextPayout: { releaseAt: string; amountMinor: number; count: number; accounts: number } | null;
    /** Vendido no mês corrente e no anterior, de todos os CNPJs. */
    month: { currentMinor: number; previousMinor: number };
  };
  upcomingSessions: PartnerUpcomingSession[];
  /** Divulgadores do próximo evento que tem algum (cartão "Divulgadores", D27). */
  promoters: PartnerHomePromoters | null;
  /** Cartão "Cupons": `null` sem cupom ativo nem uso na semana. */
  promoCodes: PromoCodesSummary | null;
  /** Tour do painel: `show` quando abre sozinho na entrada; `tipsOff` desliga as dicas. */
  tour: { show: boolean; tipsOff: boolean };
  week: PartnerWeekDay[];
  plans: Array<{ itemId: string; until: string | null }>;
  /** Para as linhas do Mais (p24). */
  summary: { documents: number; pendingVerifications: number };
}
