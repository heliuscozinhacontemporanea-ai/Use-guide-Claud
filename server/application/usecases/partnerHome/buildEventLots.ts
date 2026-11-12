import type { Ticket, TicketType } from '../../../domain/ticketing';
import { zonedDayKey } from '../../../shared/kernel/timeZones';

export type EventLotStatus = 'on_sale' | 'sold_out' | 'not_started' | 'paused' | 'ended';

/** Vendas de um lote na página do evento (A5): sem cortesias e sem o que já foi reembolsado. */
export interface EventLotView {
  id: string;
  occurrenceId: string;
  name: string;
  priceMinor: number;
  quantity: number;
  sold: number;
  /** Preço dos ingressos vendidos, antes dos cupons (o cupom é do pedido, não do lote). */
  soldMinor: number;
  status: EventLotStatus;
  salesStartsAt: string | null;
  salesEndsAt: string | null;
  /** Ingressos vendidos por dia, no fuso do evento; só os dias com venda, em ordem. */
  days: Array<{ day: string; count: number }>;
}

// Ingresso que conta como vendido; o "transferred" vira outro ingresso e contaria duas vezes.
const SOLD = new Set<Ticket['status']>(['issued', 'checked_in', 'refund_pending']);
const HIDDEN = new Set<TicketType['status']>(['draft', 'archived']);

function statusOf(type: TicketType, sold: number, nowIso: string): EventLotStatus {
  if (type.status === 'paused') return 'paused';
  if (type.status === 'ended' || (type.salesEndsAt && type.salesEndsAt <= nowIso)) return 'ended';
  if (type.status === 'sold_out' || sold >= type.quantity) return 'sold_out';
  if (type.salesStartsAt && type.salesStartsAt > nowIso) return 'not_started';
  return 'on_sale';
}

/** Lotes do evento com o vendido e o ritmo por dia; quem chama já conferiu a posse do evento. */
export function buildEventLots(input: {
  ticketTypes: TicketType[];
  tickets: Ticket[];
  timeZone: string;
  nowIso: string;
}): EventLotView[] {
  const byType = new Map<string, Ticket[]>();
  for (const ticket of input.tickets) {
    if (ticket.courtesyId || !SOLD.has(ticket.status)) continue;
    byType.set(ticket.ticketTypeId, [...(byType.get(ticket.ticketTypeId) ?? []), ticket]);
  }
  return input.ticketTypes
    .filter((type) => type.kind !== 'courtesy' && !HIDDEN.has(type.status))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.priceMinor - b.priceMinor)
    .map((type) => {
      const sold = byType.get(type.id) ?? [];
      const days = new Map<string, number>();
      for (const ticket of sold) {
        if (!ticket.issuedAt) continue;
        const day = zonedDayKey(ticket.issuedAt, input.timeZone);
        days.set(day, (days.get(day) ?? 0) + 1);
      }
      return {
        id: type.id,
        occurrenceId: type.occurrenceId,
        name: type.name,
        priceMinor: type.priceMinor,
        quantity: type.quantity,
        sold: sold.length,
        soldMinor: sold.reduce(
          (sum, ticket) => sum + (ticket.ticketTypeSnapshot?.unitPriceMinor ?? type.priceMinor),
          0
        ),
        status: statusOf(type, sold.length, input.nowIso),
        salesStartsAt: type.salesStartsAt ?? null,
        salesEndsAt: type.salesEndsAt ?? null,
        days: [...days.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([day, count]) => ({ day, count })),
      };
    });
}
