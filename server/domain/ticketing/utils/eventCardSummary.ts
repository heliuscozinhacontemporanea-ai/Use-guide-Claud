import {
  type EventCancellationPolicy,
  freeCancellationHoursOf,
} from '../../../shared/kernel/cancellationPolicy';
import type { ListingCardSummary } from '../../../shared/kernel/listingCardSummary';
import type { ServiceFeeMode } from '../../../shared/kernel/platformFees';
import type { TicketType } from '../types/ticketingTypes';

export interface CardSummaryOccurrence {
  id: string;
  startsAt: string;
  status: string;
}

/** Ingresso que conta para o "a partir de": público, à venda, com sobra e de uma sessão que vem. */
function countsForCard(type: TicketType, nowMs: number): boolean {
  const remaining = type.quantity - type.soldCount - type.reservedCount;
  const salesOpen = !type.salesEndsAt || new Date(type.salesEndsAt).getTime() > nowMs;
  return (
    (type.kind === 'paid' || type.kind === 'free') &&
    type.visibility === 'public' &&
    type.status === 'on_sale' &&
    remaining > 0 &&
    salesOpen
  );
}

/**
 * "A partir de" do evento (D37 item 10): o ingresso inteiro mais barato à venda nas próximas sessões.
 * Meia-entrada e cortesia não entram. Quando o comprador paga a taxa de serviço (D14), ela já vem
 * somada. Só ingresso gratuito à venda: R$ 0. Nada à venda: sem preço.
 */
export function eventCardSummary(params: {
  occurrences: readonly CardSummaryOccurrence[];
  typesByOccurrence: ReadonlyMap<string, readonly TicketType[]>;
  serviceFeeMode: ServiceFeeMode;
  cancellationPolicy: EventCancellationPolicy;
  ticketServiceFeeMinor: number;
  nowMs: number;
}): ListingCardSummary | null {
  const upcoming = params.occurrences.filter(
    (occurrence) =>
      (occurrence.status === 'scheduled' || occurrence.status === 'postponed') &&
      new Date(occurrence.startsAt).getTime() > params.nowMs
  );
  const types = upcoming
    .flatMap((occurrence) => params.typesByOccurrence.get(occurrence.id) ?? [])
    .filter((type) => countsForCard(type, params.nowMs));
  if (types.length === 0) return null;
  const paid = types.filter((type) => type.kind === 'paid' && type.priceMinor > 0);
  const freeHours = freeCancellationHoursOf('event', params.cancellationPolicy);
  const cancellation = freeHours !== null ? { freeCancellationHours: freeHours } : {};
  if (paid.length === 0) {
    return { fromPriceMinor: 0, priceUnit: 'ticket', serviceFeeIncluded: false, ...cancellation };
  }
  const cheapest = Math.min(...paid.map((type) => type.priceMinor));
  const withFee = params.serviceFeeMode === 'pass_to_buyer';
  return {
    fromPriceMinor: cheapest + (withFee ? params.ticketServiceFeeMinor : 0),
    priceUnit: 'ticket',
    serviceFeeIncluded: withFee,
    ...cancellation,
  };
}
