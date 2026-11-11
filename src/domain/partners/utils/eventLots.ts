import { zonedDayKey } from '../../../shared/utils/timeZones';
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

/** Período em que o gráfico do lote faz sentido, em dias do fuso do evento. */
export interface LotPeriod {
  /** Abertura das vendas ou, sem data cadastrada, a primeira venda; `null` sem nenhuma das duas. */
  from: string | null;
  /** Último dia mostrado: hoje no lote à venda, a última venda no lote encerrado ou esgotado. */
  to: string;
}

const CLOSED: PartnerEventLot['status'][] = ['ended', 'sold_out'];

/**
 * Período do gráfico (A5): começa na abertura das vendas e, no lote que já encerrou ou esgotou,
 * acaba na última venda (sem venda, no fim das vendas); no lote aberto, acaba hoje.
 */
export function lotPeriod(lot: PartnerEventLot, today: string, timeZone: string): LotPeriod {
  const firstSale = lot.days[0]?.day ?? null;
  const lastSale = lot.days[lot.days.length - 1]?.day ?? null;
  const start = lot.salesStartsAt ? zonedDayKey(lot.salesStartsAt, timeZone) : null;
  const end = lot.salesEndsAt ? zonedDayKey(lot.salesEndsAt, timeZone) : null;
  const closedOn = CLOSED.includes(lot.status) ? (lastSale ?? end ?? today) : today;
  return {
    from: [start, firstSale].filter((day): day is string => Boolean(day)).sort()[0] ?? null,
    to: closedOn < today ? closedOn : today,
  };
}

export interface LotWindow {
  /** Os 14 dias da janela, do mais antigo ao mais novo; `inPeriod` falso fica sem barra. */
  bars: Array<{ day: string; count: number; inPeriod: boolean }>;
  total: number;
  best: { day: string; count: number } | null;
  hasOlder: boolean;
  hasNewer: boolean;
}

/**
 * Janela de 14 dias do gráfico do lote (A5). `index` 0 termina no fim do período; cada passo volta
 * 14 dias, até a janela que contém o início do período.
 */
export function lotWindow(
  days: PartnerEventLot['days'],
  period: LotPeriod,
  index: number
): LotWindow {
  const counts = new Map(days.map((entry) => [entry.day, entry.count]));
  const end = toMs(period.to) - index * LOT_WINDOW_DAYS * DAY_MS;
  const bars = Array.from({ length: LOT_WINDOW_DAYS }, (_, position) => {
    const day = toDay(end - (LOT_WINDOW_DAYS - 1 - position) * DAY_MS);
    return {
      day,
      count: counts.get(day) ?? 0,
      inPeriod: (!period.from || day >= period.from) && day <= period.to,
    };
  });
  const best = bars.reduce<LotWindow['best']>(
    (top, bar) => (bar.count > (top?.count ?? 0) ? { day: bar.day, count: bar.count } : top),
    null
  );
  return {
    bars,
    total: bars.reduce((sum, bar) => sum + bar.count, 0),
    best,
    hasOlder: Boolean(period.from) && (period.from as string) < (bars[0]?.day ?? period.to),
    hasNewer: index > 0,
  };
}
