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
  names: Map<string, string | null>;
  /** @ de cada divulgador do evento, pelo ID. */
  promoters?: Map<string, string | null>;
}

// Pedidos que aparecem para o parceiro: os pagos e o que veio depois do pagamento.
const SHOWN = new Set(['paid', 'partially_refunded', 'refunded', 'chargeback', 'canceled']);
// Ingresso que conta como vendido; o "transferred" vira outro ingresso e contaria duas vezes.
const SOLD_TICKETS = new Set(['issued', 'checked_in', 'refund_pending']);
export const ORDERS_LIMIT = 100;

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

/** Totais e pedidos da página do evento; quem chama já conferiu que o evento é do parceiro. */
export function buildEventSales(input: EventSalesInput) {
  const refundsByOrder = new Map<string, Refund[]>();
  for (const refund of input.refunds) {
    refundsByOrder.set(refund.orderId, [...(refundsByOrder.get(refund.orderId) ?? []), refund]);
  }
  const refundOf = (orderId: string) => summarize(refundsByOrder.get(orderId) ?? []);
  const ticketsByOrder = new Map<string, Ticket[]>();
  for (const ticket of input.tickets) {
    ticketsByOrder.set(ticket.orderId, [...(ticketsByOrder.get(ticket.orderId) ?? []), ticket]);
  }

  const shown = input.orders
    .filter((order) => SHOWN.has(order.status))
    .filter((order) => order.status !== 'canceled' || refundsByOrder.has(order.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const orders = shown.map((order): PartnerEventOrderView => {
    const refund = refundOf(order.id);
    const tickets = ticketsByOrder.get(order.id) ?? [];
    const lines = new Map<string, { name: string; unitPriceMinor: number; quantity: number }>();
    for (const ticket of tickets) {
      const name = ticket.ticketTypeSnapshot?.name ?? '';
      const unitPriceMinor = ticket.ticketTypeSnapshot?.unitPriceMinor ?? 0;
      const key = `${name}|${unitPriceMinor}`;
      const line = lines.get(key) ?? { name, unitPriceMinor, quantity: 0 };
      line.quantity += 1;
      lines.set(key, line);
    }
    return {
      id: order.id,
      code: order.id.slice(0, 6),
      buyerName: input.names.get(order.buyerId) ?? null,
      promoterUsername: order.promoterId ? (input.promoters?.get(order.promoterId) ?? null) : null,
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
    };
  });

  // Vendido: valor dos ingressos, sem a taxa de serviço, menos o que já voltou ao comprador.
  const soldMinor = shown.reduce((sum, order) => {
    const refund = refundOf(order.id);
    if (statusOf(order, refund) === 'refunded') return sum;
    const tickets = order.subtotalMinor - order.discountMinor;
    return sum + Math.max(0, tickets - (refund?.doneTicketsMinor ?? 0));
  }, 0);

  return {
    soldMinor,
    ticketsSold: input.tickets.filter((ticket) => SOLD_TICKETS.has(ticket.status)).length,
    receiveMinor: input.entries
      .filter((entry) => entry.status !== 'canceled')
      .reduce((sum, entry) => sum + entry.partnerAmountMinor, 0),
    orders: orders.slice(0, ORDERS_LIMIT),
    ordersTotal: orders.length,
  };
}
