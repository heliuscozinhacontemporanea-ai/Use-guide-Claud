import type { OwnerSlotSummary } from '../../../domain/bookings';
import type { PayoutEntryView } from '../../../domain/payment';
import { businessDayStartMs } from '../../../shared/kernel/businessDay';
import type { PartnerWeekDay } from './partnerHomeTypes';

const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo (AGENTS.md §1).
const OFFSET_MS = 3 * HOUR_MS;

/** 00:00 em Fortaleza do dia 1 do mês de `iso`, e do mês anterior. */
export function businessMonthStarts(iso: string): { current: number; previous: number } {
  const local = new Date(new Date(iso).getTime() - OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  return {
    current: Date.UTC(year, month, 1) + OFFSET_MS,
    previous: Date.UTC(year, month - 1, 1) + OFFSET_MS,
  };
}

/** Vendido no mês corrente e no anterior; vendas canceladas não contam. */
export function sumMonthSales(
  entries: PayoutEntryView[],
  nowIso: string
): { currentMinor: number; previousMinor: number } {
  const { current, previous } = businessMonthStarts(nowIso);
  let currentMinor = 0;
  let previousMinor = 0;
  for (const entry of entries) {
    if (entry.status === 'canceled') continue;
    const at = new Date(entry.createdAt).getTime();
    if (at >= current) currentMinor += entry.grossMinor;
    else if (at >= previous) previousMinor += entry.grossMinor;
  }
  return { currentMinor, previousMinor };
}

/** Vagas vendidas e oferecidas por dia e estabelecimento, de hoje até 6 dias depois. */
export function summarizeWeek(slots: OwnerSlotSummary[], nowIso: string): PartnerWeekDay[] {
  const start = businessDayStartMs(nowIso);
  const end = start + 7 * DAY_MS;
  const byKey = new Map<string, PartnerWeekDay>();
  for (const slot of slots) {
    const day = businessDayStartMs(slot.startsAt);
    if (day < start || day >= end) continue;
    const date = new Date(day).toISOString();
    const key = `${date}|${slot.guideItemId}`;
    const row = byKey.get(key) ?? {
      date,
      establishmentIds: [slot.guideItemId],
      sold: 0,
      capacity: 0,
    };
    row.sold += slot.unitsCount;
    row.capacity += slot.capacityTotal;
    byKey.set(key, row);
  }
  return [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date));
}
