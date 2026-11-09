import type { PartnerReportPeriod } from '../types/partnerHome';
import { monthGrid, weekStart } from './agendaCalendar';

export type ReportUnit = 'day' | 'week' | 'month';

/** Agrupamento inicial de cada período (p23); a pessoa pode trocar no botão "^". */
export const DEFAULT_UNIT: Record<PartnerReportPeriod, ReportUnit> = {
  '7d': 'day',
  '30d': 'week',
  '12m': 'month',
};

/** Junta os totais diários em semanas (segunda a domingo) ou meses, no fuso do painel (D28). */
export function groupReportBuckets(
  buckets: Array<{ start: string; soldMinor: number }>,
  unit: ReportUnit,
  timeZone: string
): Array<{ start: string; soldMinor: number }> {
  if (unit === 'day') return buckets;
  const groups = new Map<string, number>();
  for (const bucket of buckets) {
    const day = new Date(bucket.start);
    const key = (
      unit === 'week' ? weekStart(day, timeZone) : monthGrid(day, timeZone).month
    ).toISOString();
    groups.set(key, (groups.get(key) ?? 0) + bucket.soldMinor);
  }
  return [...groups.entries()].map(([start, soldMinor]) => ({ start, soldMinor }));
}
