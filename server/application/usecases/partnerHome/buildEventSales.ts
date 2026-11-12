import type { PayoutEntryView } from '../../../domain/payment';
import type { Refund, Ticket, TicketOrder } from '../../../domain/ticketing';

export type RefundState = 'in_progress' | 'done' | 'failed' | 'rejected';

export type PartnerOrderStatus =
  | 'paid'
  | 'refund_requested'
  | 'partially_refunded'
  | 'refunded'
  | 'disputed';

/** Pedido na página do evento (p11, p12): só o que o parceiro precisa, sem e-mail nem documento. */
export interface PartnerEventOrderView {
  id: string;
  /** Código curto mostrado ao parceiro e ao comprador. */
  code: string;
  /** Nome do perfil público; `null` quando o comprador não tem. */
  buyerName: string | null;
  /** @ do divulgador do link usado na compra (D27), ou null. */
  promoterUsername: string | null;
  occurrenceId: string;
  tickets: number;
  createdAt: string;
  status: PartnerOrderStatus;
  lines: Array<{ name: string; unitPriceMinor: number; quantity: number }>;
  serviceFeeMinor: number;
  /** Gravado pelo webhook; pedidos antigos ficam sem. */
  paymentMethod: 'card' | 'pix' | 'other' | null;
  /** Soma dos reembolsos do pedido (um pedido pode ter um por ingresso). */
  refund: {
    state: RefundState;
    amountMinor: number;
    /** Devolve tudo, com a taxa de serviço (arrependimento ou cancelamento pelo proprietário). */
    full: boolean;
    at: string;
  } | null;
}

export interface EventSalesInput {
  orders: TicketOrder[];
  tickets: Ticket[];
  refunds: Refund[];
  entries: PayoutEntryView[];
}

export interface EventOrderRowsInput {
  orders: TicketOrder[];
  tickets: Ticket[];
  refunds: Refund[];
  /** @ de cada divulgador do evento, pelo ID. */
  promoters?: Map<string, string | null>;
}

/** Linha da lista de pedidos; `buyerId` fica no servidor e só serve para buscar o nome público. */
export interface EventOrderRow {
  buyerId: string;
  view: PartnerEventOrderView;
}

// Pedidos que aparecem para o parceiro: os pagos e o que veio depois do pagamento.
const SHOWN = new Set(['paid', 'partially_refunded', 'refunded', 'chargeback', 'canceled']);
// Ingresso que conta como vendido; o "transferred" vira outro ingresso e contaria duas vezes.
const SOLD_TICKETS = new Set(['issued', 'checked_in', 'refund_pending']);

interface OrderRefund {
  state: RefundState;
  doneMinor: number;
  /** Parte já devolvida que era valor de ingresso (sem a taxa de serviço). */
  doneTicketsMinor: number;
  amountMinor: number;
  at: string;
}

const IN_PROGRESS = new Set<Refund['status']>(['requested', 'pending_provider']);

/** Junta os reembolsos de um pedido: em andamento vence; depois, falha; depois, concluído. */
function summarize(refunds: Refund[]): OrderRefund | null {
  if (refunds.length === 0) return null;
  const at = refunds
    .map((refund) => refund.completedAt ?? refund.createdAt)
    .sort()
    .at(-1)!;
  const approved = refunds.filter((refund) => refund.status === 'approved');
  const doneMinor = approved.reduce((sum, refund) => sum + refund.amountMinor, 0);
  const doneTicketsMinor = approved.reduce(
    (sum, refund) => sum + refund.amountMinor - refund.serviceFeeMinor,
    0
  );
  const pending = refunds.filter((refund) => IN_PROGRESS.has(refund.status));
  if (pending.length > 0) {
    const amountMinor = pending.reduce((sum, refund) => sum + refund.amountMinor, 0);
    return { state: 'in_progress', doneMinor, doneTicketsMinor, amountMinor, at };
  }
  const latest = [...refunds].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1)!;
  if (latest.status === 'failed' || latest.status === 'rejected') {
    return {
      state: latest.status,
      doneMinor,
      doneTicketsMinor,
      amountMinor: latest.amountMinor,
      at,
    };
  }
  return { state: 'done', doneMinor, doneTicketsMinor, amountMinor: doneMinor, at };
}

function statusOf(order: TicketOrder, refund: OrderRefund | null): PartnerOrderStatus {
  if (order.status === 'chargeback') return 'disputed';
  if (refund?.state === 'in_progress') return 'refund_requested';
  if (order.status === 'refunded' || (order.status === 'canceled' && refund?.state === 'done'))
    return 'refunded';
  if (order.status === 'partially_refunded') return 'partially_refunded';
  return 'paid';
}

function groupBy<T extends { orderId: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(item.orderId, [...(map.get(item.orderId) ?? []), item]);
  return map;
}

function shownOrders(orders: TicketOrder[], refundsByOrder: Map<string, Refund[]>) {
  return orders
    .filter((order) => SHOWN.has(order.status))
    .filter((order) => order.status !== 'canceled' || refundsByOrder.has(order.id));
}

/** Pedidos da página do evento, do mais recente ao mais antigo, ainda sem o nome do comprador. */
export function buildEventOrderRows(input: EventOrderRowsInput): EventOrderRow[] {
  const refundsByOrder = groupBy(input.refunds);
  const ticketsByOrder = groupBy(input.tickets);
  return shownOrders(input.orders, refundsByOrder)
    .map((order): EventOrderRow => {
      const refund = summarize(refundsByOrder.get(order.id) ?? []);
      const lines = new Map<string, { name: string; unitPriceMinor: number; quantity: number }>();
      const tickets = ticketsByOrder.get(order.id) ?? [];
      for (const ticket of tickets) {
        const name = ticket.ticketTypeSnapshot?.name ?? '';
        const unitPriceMinor = ticket.ticketTypeSnapshot?.unitPriceMinor ?? 0;
        const key = `${name}|${unitPriceMinor}`;
        const line = lines.get(key) ?? { name, unitPriceMinor, quantity: 0 };
        line.quantity += 1;
        lines.set(key, line);
      }
      return {
        buyerId: order.buyerId,
        view: {
          id: order.id,
          code: order.id.slice(0, 6),
          buyerName: null,
          promoterUsername: order.promoterId
            ? (input.promoters?.get(order.promoterId) ?? null)
            : null,
          occurrenceId: order.occurrenceId,
          tickets: tickets.length,
          createdAt: order.paidAt ?? order.createdAt,
          status: statusOf(order, refund),
          lines: [...lines.values()],
          serviceFeeMinor: order.serviceFeeMinor,
          paymentMethod: order.paymentMethod ?? null,
          refund: refund
            ? {
                state: refund.state,
                amountMinor: refund.amountMinor,
                full: refund.amountMinor >= order.totalMinor,
                at: refund.at,
              }
            : null,
        },
      };
    })
    .sort(
      (a, b) =>
        b.view.createdAt.localeCompare(a.view.createdAt) || b.view.id.localeCompare(a.view.id)
    );
}

/**
 * A conta de "Você recebe" (A4), linha a linha. Fecha sempre:
 * ingressos − cupons − reembolsos = vendido; vendido − taxa − ajustes = você recebe.
 */
export interface EventSalesBreakdown {
  /** Preço dos ingressos dos pedidos que contam, antes dos cupons. */
  ticketsMinor: number;
  discountMinor: number;
  /** Valor de ingresso que já voltou ao comprador (sem a taxa de serviço). */
  refundedMinor: number;
  platformFeeMinor: number;
  /** Valor sobre o qual a taxa da plataforma incidiu, para mostrar o percentual. */
  feeBaseMinor: number;
  /** Multas descontadas do repasse e vendas que saíram dele (contestação perdida). */
  adjustmentsMinor: number;
  /** Taxa de serviço paga pelos compradores; não sai do valor do proprietário. */
  buyerServiceFeeMinor: number;
}

/** Totais da página do evento; quem chama já conferiu que o evento é do parceiro. */
export function buildEventSales(input: EventSalesInput) {
  const refundsByOrder = groupBy(input.refunds);
  const shown = shownOrders(input.orders, refundsByOrder);

  // Vendido: valor dos ingressos, sem a taxa de serviço, menos o que já voltou ao comprador.
  let soldMinor = 0;
  let ticketsMinor = 0;
  let discountMinor = 0;
  for (const order of shown) {
    const refund = summarize(refundsByOrder.get(order.id) ?? []);
    if (statusOf(order, refund) === 'refunded') continue;
    ticketsMinor += order.subtotalMinor;
    discountMinor += order.discountMinor;
    soldMinor += Math.max(
      0,
      order.subtotalMinor - order.discountMinor - (refund?.doneTicketsMinor ?? 0)
    );
  }

  const entries = input.entries.filter((entry) => entry.status !== 'canceled');
  const sum = (pick: (entry: PayoutEntryView) => number) =>
    entries.reduce((total, entry) => total + pick(entry), 0);
  // O mesmo líquido de Ganhos: a parte do proprietário menos a multa descontada do repasse.
  const receiveMinor = sum((entry) => Math.max(0, entry.partnerAmountMinor - entry.offsetMinor));
  const platformFeeMinor = sum((entry) => entry.platformFeeMinor);

  return {
    soldMinor,
    ticketsSold: input.tickets.filter((ticket) => SOLD_TICKETS.has(ticket.status)).length,
    receiveMinor,
    ordersTotal: shown.length,
    breakdown: {
      ticketsMinor,
      discountMinor,
      refundedMinor: ticketsMinor - discountMinor - soldMinor,
      platformFeeMinor,
      feeBaseMinor: sum((entry) => entry.grossMinor - entry.serviceFeeMinor - entry.refundedMinor),
      adjustmentsMinor: soldMinor - platformFeeMinor - receiveMinor,
      buyerServiceFeeMinor: sum((entry) => entry.serviceFeeMinor),
    } satisfies EventSalesBreakdown,
  };
}
