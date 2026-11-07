/** Início do painel (D27), como a rota `/api/partner-home` devolve. Textos ficam no i18n. */
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
  /** Só nas sessões: cortesias que ocupam lugar (D27). */
  courtesies?: number;
  /** Só nos horários de reserva, para os cartões de "Agora" (D27). */
  bookings?: number;
  waitingBookings?: number;
  meetingPoint?: string | null;
  serviceEndsAt?: string;
}

export interface PartnerEstablishment {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  unansweredReviews: number;
}

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

/** Divulgadores do próximo evento que tem algum (D27). */
export interface PartnerHomePromoters {
  eventId: string;
  title: string;
  establishmentIds: string[];
  owedMinor: number;
  top: Array<{ username: string | null; tickets: number; owedMinor: number }>;
}

/** Vagas de reserva de um dia (00:00 em Fortaleza) de um estabelecimento. */
export interface PartnerWeekDay {
  date: string;
  establishmentIds: string[];
  sold: number;
  capacity: number;
}

export interface PartnerHomeView {
  cards: string[];
  establishments: PartnerEstablishment[];
  attention: PartnerAttentionItem[];
  today: PartnerTodayItem[];
  /** Horários de ontem a amanhã e sessões até amanhã; o aparelho escolhe os cartões de "Agora". */
  agora: PartnerTodayItem[];
  numbers: {
    salesTodayMinor: number;
    salesTodayCount: number;
    nextPayout: { releaseAt: string; amountMinor: number; count: number; accounts: number } | null;
    month: { currentMinor: number; previousMinor: number };
  };
  upcomingSessions: PartnerUpcomingSession[];
  promoters: PartnerHomePromoters | null;
  /** Tour do painel concluído ou dispensado: não abre mais sozinho. */
  tourDone: boolean;
  week: PartnerWeekDay[];
  plans: Array<{ itemId: string; until: string | null }>;
  summary: { documents: number; pendingVerifications: number };
}

export type PartnerCatalogEventStatus = 'published' | 'draft' | 'paused' | 'ended';

/** Linha de evento no Catálogo (p09), como `/api/partner-home/catalog` devolve. */
export interface PartnerCatalogEvent {
  id: string;
  title: string;
  establishmentIds: string[];
  status: PartnerCatalogEventStatus;
  missing: 'cover' | 'sessions' | null;
  sessions: number;
  nextStartsAt: string | null;
  lastStartsAt: string | null;
  sold: number;
}

export type PartnerOrderStatus =
  | 'paid'
  | 'refund_requested'
  | 'partially_refunded'
  | 'refunded'
  | 'disputed';

/** Pedido na página do evento (p11, p12): sem e-mail nem documento do comprador. */
export interface PartnerEventOrder {
  id: string;
  code: string;
  buyerName: string | null;
  /** @ do divulgador do link usado na compra (D27). */
  promoterUsername: string | null;
  occurrenceId: string;
  tickets: number;
  createdAt: string;
  status: PartnerOrderStatus;
  lines: Array<{ name: string; unitPriceMinor: number; quantity: number }>;
  serviceFeeMinor: number;
  paymentMethod: 'card' | 'pix' | 'other' | null;
  refund: {
    state: 'in_progress' | 'done' | 'failed' | 'rejected';
    amountMinor: number;
    full: boolean;
    at: string;
  } | null;
}

/** Página do evento · Vendas, como `/api/partner-home/events/:id/sales` devolve. */
export interface PartnerEventSales {
  event: { id: string; title: string; status: PartnerCatalogEventStatus; sessions: number };
  soldMinor: number;
  ticketsSold: number;
  receiveMinor: number;
  sessions: Array<{
    id: string;
    startsAt: string;
    sold: number;
    capacity: number;
    courtesies: number;
  }>;
  /** Pedidos mostrados na página; a lista vem por página em `/orders`. */
  ordersTotal: number;
}

export type PartnerEventOrdersFilter = 'all' | 'refunds';

export interface PartnerEventOrdersQuery {
  q?: string;
  filter: PartnerEventOrdersFilter;
  cursor?: string;
}

/** Uma página de `/api/partner-home/events/:id/orders`. */
export interface PartnerEventOrdersPage {
  data: PartnerEventOrder[];
  nextCursor: string | null;
  total: number;
}

/** Venda dentro de um repasse (p21). */
export interface PartnerPayoutLine {
  id: string;
  title: string | null;
  referenceType: string;
  serviceEndsAt: string;
  grossMinor: number;
  serviceFeeMinor: number;
  refundedMinor: number;
  platformFeeMinor: number;
  offsetMinor: number;
  netMinor: number;
}

/** Repasse na tela (p20): as vendas do mesmo CNPJ que caem no mesmo dia. */
export interface PartnerPayoutGroup {
  id: string;
  status: 'scheduled' | 'held' | 'paid';
  date: string;
  accountKey: string;
  account: { maskedDocument: string; name: string | null };
  amountMinor: number;
  holdReasons: string[];
  lines: PartnerPayoutLine[];
}

/** Ganhos, como `/api/partner-home/earnings` devolve. */
export interface PartnerEarnings {
  toReceiveMinor: number;
  receivedThisMonthMinor: number;
  payouts: PartnerPayoutGroup[];
  accounts: { count: number; ready: number };
}

export type PartnerReportPeriod = '7d' | '30d' | '12m';

/** Relatórios (p23), como `/api/partner-home/reports` devolve. */
export interface PartnerReports {
  period: PartnerReportPeriod;
  soldMinor: number;
  buckets: Array<{ start: string; soldMinor: number }>;
  items: Array<{
    key: string;
    title: string | null;
    referenceType: string;
    soldMinor: number;
    sales: number;
    tickets: number;
    promoterTickets: number;
    people: number;
    groups: number;
  }>;
  truncated: boolean;
}
