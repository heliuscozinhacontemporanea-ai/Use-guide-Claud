import type { OwnerSlotSummary } from '../../../domain/bookings';
import type { PayoutEntryView } from '../../../domain/payment';
import { businessDayStartMs, businessMonthStartMs } from '../../../shared/kernel/businessDay';
import type { PartnerWeekDay } from './partnerHomeTypes';

const DAY_MS = 24 * 60 * 60_000;

/** 00:00 do dia 1 do mês de `iso`, e do mês anterior, no fuso do painel. */
export function businessMonthStarts(
  iso: string,
  timeZone: string
): { current: number; previous: number } {
  return {
    current: businessMonthStartMs(iso, timeZone),
    previous: businessMonthStartMs(iso, timeZone, 1),
  };
}

/** Vendido no mês corrente e no anterior; vendas canceladas não contam. */
export function sumMonthSales(
  entries: PayoutEntryView[],
  nowIso: string,
  timeZone: string
): { currentMinor: number; previousMinor: number } {
  const { current, previous } = businessMonthStarts(nowIso, timeZone);
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
export function summarizeWeek(
  slots: OwnerSlotSummary[],
  nowIso: string,
  timeZone: string
): PartnerWeekDay[] {
  const start = businessDayStartMs(nowIso, timeZone);
  const end = start + 7 * DAY_MS;
  const byKey = new Map<string, PartnerWeekDay>();
  for (const slot of slots) {
    const day = businessDayStartMs(slot.startsAt, timeZone);
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
