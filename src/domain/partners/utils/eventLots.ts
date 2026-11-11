import type { PartnerEventLot } from '../types/partnerHome';

export const LOT_WINDOW_DAYS = 14;
const DAY_MS = 86_400_000;

// Com sessões juntas, vale a situação mais "viva" entre os lotes de mesmo nome e preço.
const STATUS_ORDER: PartnerEventLot['status'][] = [
  'on_sale',
  'not_started',
  'paused',
  'sold_out',
  'ended',
];

const toMs = (day: string) => Date.parse(`${day}T00:00:00.000Z`);
const toDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Dia `YYYY-MM-DD` como data, para formatar com `timeZone: 'UTC'` sem mudar de dia. */
export const dayToDate = (day: string) => new Date(toMs(day));

/**
 * Lotes de uma sessão ou, sem sessão escolhida, de todas: lotes de mesmo nome e preço em sessões
 * diferentes viram uma linha só, somando vendidos, lugares e os dias.
 */
export function lotsFor(lots: PartnerEventLot[], occurrenceId: string | null): PartnerEventLot[] {
  if (occurrenceId) return lots.filter((lot) => lot.occurrenceId === occurrenceId);
  const merged = new Map<string, PartnerEventLot>();
  for (const lot of lots) {
    const key = `${lot.name}|${lot.priceMinor}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...lot, days: [...lot.days] });
      continue;
    }
    const days = new Map(current.days.map((entry) => [entry.day, entry.count]));
    for (const entry of lot.days) days.set(entry.day, (days.get(entry.day) ?? 0) + entry.count);
    merged.set(key, {
      ...current,
      id: `${current.id}+${lot.id}`,
      quantity: current.quantity + lot.quantity,
      sold: current.sold + lot.sold,
      soldMinor: current.soldMinor + lot.soldMinor,
      status:
        STATUS_ORDER.find((status) => status === current.status || status === lot.status) ??
        current.status,
      // Datas de venda diferentes por sessão não cabem numa linha só.
      salesStartsAt: current.salesStartsAt === lot.salesStartsAt ? current.salesStartsAt : null,
      salesEndsAt: current.salesEndsAt === lot.salesEndsAt ? current.salesEndsAt : null,
      days: [...days.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, count]) => ({ day, count })),
    });
  }
  return [...merged.values()];
}

export interface LotWindow {
  /** Os 14 dias da janela, do mais antigo ao mais novo, com zero onde não houve venda. */
  bars: Array<{ day: string; count: number }>;
  total: number;
  best: { day: string; count: number } | null;
  hasOlder: boolean;
  hasNewer: boolean;
}

/**
 * Janela de 14 dias do gráfico do lote (A5). `index` 0 termina hoje; cada passo volta 14 dias, até
 * a janela que contém a primeira venda.
 */
export function lotWindow(days: PartnerEventLot['days'], today: string, index: number): LotWindow {
  const counts = new Map(days.map((entry) => [entry.day, entry.count]));
  const end = toMs(today) - index * LOT_WINDOW_DAYS * DAY_MS;
  const bars = Array.from({ length: LOT_WINDOW_DAYS }, (_, position) => {
    const day = toDay(end - (LOT_WINDOW_DAYS - 1 - position) * DAY_MS);
    return { day, count: counts.get(day) ?? 0 };
  });
  const first = days[0]?.day;
  const best = bars.reduce<LotWindow['best']>(
    (top, bar) => (bar.count > (top?.count ?? 0) ? bar : top),
    null
  );
  return {
    bars,
    total: bars.reduce((sum, bar) => sum + bar.count, 0),
    best,
    hasOlder: Boolean(first) && toMs(first as string) < toMs(bars[0]?.day ?? today),
    hasNewer: index > 0,
  };
}
