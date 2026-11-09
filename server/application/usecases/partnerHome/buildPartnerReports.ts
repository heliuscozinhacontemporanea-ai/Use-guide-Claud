import { businessDayStartMs, businessMonthStartMs } from '../../../shared/kernel/businessDay';
import type { PayoutEntryView } from '../../../domain/payment';

export type ReportPeriod = '7d' | '30d' | '12m';

export interface PartnerReportsView {
  period: ReportPeriod;
  soldMinor: number;
  /** Fuso do painel (D28), em que os dias foram contados; a tela agrupa semanas e meses nele. */
  timeZone: string;
  /** Um total por dia, do mais antigo ao atual; a tela agrupa em semana ou mês. */
  buckets: Array<{ start: string; soldMinor: number }>;
  items: Array<{
    key: string;
    title: string | null;
    referenceType: string;
    soldMinor: number;
    sales: number;
    /** Eventos: ingressos que valem; quantos deles vieram de link de divulgador (D27). */
    tickets: number;
    promoterTickets: number;
    /** Passeios, aluguéis e translados: pessoas, ou grupos quando a oferta vende por grupo. */
    people: number;
    groups: number;
  }>;
  /** A leitura parou no teto de páginas: os totais podem estar abaixo do real. */
  truncated: boolean;
}

const DAY_MS = 24 * 60 * 60_000;

/**
 * Início de cada dia do período no fuso do painel (D28), em UTC: 7 e 30 dias até hoje; 12 meses
 * desde o dia 1 do mês de 11 meses atrás. O Brasil não tem horário de verão, então os dias têm 24 h.
 */
export function reportBuckets(period: ReportPeriod, nowIso: string, timeZone: string): string[] {
  const today = businessDayStartMs(nowIso, timeZone);
  const first =
    period === '12m'
      ? businessMonthStartMs(nowIso, timeZone, 11)
      : today - ((period === '7d' ? 7 : 30) - 1) * DAY_MS;
  const days = Math.round((today - first) / DAY_MS) + 1;
  return Array.from({ length: days }, (_, i) => new Date(first + i * DAY_MS).toISOString());
}

/** Valor do ingresso ou da reserva: sem a taxa de serviço e sem o que voltou ao comprador. */
const sold = (entry: PayoutEntryView) =>
  Math.max(0, entry.grossMinor - entry.serviceFeeMinor - entry.refundedMinor);

/** Unidades de cada venda, pelo ID do pedido ou da reserva; sem entrada, só valor e vendas. */
export interface ReportSaleUnits {
  tickets?: number;
  viaPromoter?: boolean;
  people?: number;
  groups?: number;
}

/** Vendas do período por barra e por item (p23); venda cancelada inteira não conta. */
export function buildPartnerReports(
  period: ReportPeriod,
  nowIso: string,
  timeZone: string,
  entries: PayoutEntryView[],
  truncated: boolean,
  units: Map<string, ReportSaleUnits> = new Map()
): PartnerReportsView {
  const starts = reportBuckets(period, nowIso, timeZone);
  const from = starts[0] ?? nowIso;
  const inPeriod = entries.filter(
    (entry) => entry.status !== 'canceled' && entry.createdAt >= from && entry.createdAt <= nowIso
  );
  const buckets = starts.map((start, index) => {
    const end = starts[index + 1] ?? nowIso;
    const soldMinor = inPeriod
      .filter(
        (entry) =>
          entry.createdAt >= start && (index === starts.length - 1 || entry.createdAt < end)
      )
      .reduce((sum, entry) => sum + sold(entry), 0);
    return { start, soldMinor };
  });
  const items = new Map<string, PartnerReportsView['items'][number]>();
  for (const entry of inPeriod) {
    const key = `${entry.referenceType}|${entry.title ?? ''}`;
    const item = items.get(key) ?? {
      key,
      title: entry.title,
      referenceType: entry.referenceType,
      soldMinor: 0,
      sales: 0,
      tickets: 0,
      promoterTickets: 0,
      people: 0,
      groups: 0,
    };
    const unit = units.get(entry.referenceId);
    item.soldMinor += sold(entry);
    item.sales += 1;
    item.tickets += unit?.tickets ?? 0;
    if (unit?.viaPromoter) item.promoterTickets += unit.tickets ?? 0;
    item.people += unit?.people ?? 0;
    item.groups += unit?.groups ?? 0;
    items.set(key, item);
  }
  return {
    timeZone,
    period,
    soldMinor: buckets.reduce((sum, bucket) => sum + bucket.soldMinor, 0),
    buckets,
    items: [...items.values()].sort((a, b) => b.soldMinor - a.soldMinor),
    truncated,
  };
}
