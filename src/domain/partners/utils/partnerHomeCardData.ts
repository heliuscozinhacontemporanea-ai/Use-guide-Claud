import type {
  PartnerHomeView,
  PartnerTodayItem,
  PartnerUpcomingSession,
  PartnerWeekDay,
} from '../types/partnerHome';
import type { PartnerHomeCardId } from '../types/partnerHomeCards';
import type { EstablishmentFilter } from './partnerHomeFilter';

export type PartnerCardData =
  | { id: 'today'; items: PartnerTodayItem[] }
  | { id: 'sales_today'; amountMinor: number; count: number; establishments: number }
  | { id: 'next_payout'; payout: PartnerHomeView['numbers']['nextPayout'] }
  | { id: 'next_event'; session: PartnerUpcomingSession }
  | { id: 'reviews'; rating: number; count: number; unanswered: number }
  | { id: 'week_bookings'; sold: number; capacity: number }
  | { id: 'guests'; session: PartnerUpcomingSession }
  | { id: 'plan_seal'; name: string; until: string }
  | { id: 'week_occupancy'; days: Array<{ date: string; sold: number; capacity: number }> }
  | { id: 'month_sales'; currentMinor: number; previousMinor: number };

const inFilter = (ids: string[], filter: EstablishmentFilter) =>
  filter === null || ids.length === 0 || ids.includes(filter);

function weekDays(rows: PartnerWeekDay[]) {
  const byDate = new Map<string, { date: string; sold: number; capacity: number }>();
  for (const row of rows) {
    const day = byDate.get(row.date) ?? { date: row.date, sold: 0, capacity: 0 };
    day.sold += row.sold;
    day.capacity += row.capacity;
    byDate.set(row.date, day);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Dados de um cartão no filtro atual; `null` quando não há o que mostrar (ex.: sem evento futuro),
 * e aí o cartão não aparece no Início nem na galeria (seção 6.1 da proposta).
 */
export function partnerCardData(
  id: PartnerHomeCardId,
  view: PartnerHomeView,
  today: PartnerTodayItem[],
  filter: EstablishmentFilter
): PartnerCardData | null {
  const establishments = view.establishments.filter((item) => inFilter([item.id], filter));
  const week = view.week.filter((row) => inFilter(row.establishmentIds, filter));
  switch (id) {
    case 'today':
      return { id, items: today };
    case 'sales_today':
      return {
        id,
        amountMinor: view.numbers.salesTodayMinor,
        count: view.numbers.salesTodayCount,
        establishments: view.establishments.length,
      };
    case 'next_payout':
      return { id, payout: view.numbers.nextPayout };
    case 'next_event': {
      const session = view.upcomingSessions.find((item) => inFilter(item.establishmentIds, filter));
      return session ? { id, session } : null;
    }
    case 'guests': {
      // Próxima sessão com cortesias (D27); sem convidado, o cartão não aparece.
      const session = view.upcomingSessions.find(
        (item) => item.courtesies > 0 && inFilter(item.establishmentIds, filter)
      );
      return session ? { id, session } : null;
    }
    case 'reviews': {
      const count = establishments.reduce((sum, item) => sum + item.reviewCount, 0);
      if (count === 0) return null;
      const total = establishments.reduce((sum, item) => sum + item.rating * item.reviewCount, 0);
      const unanswered = establishments.reduce((sum, item) => sum + item.unansweredReviews, 0);
      return { id, rating: total / count, count, unanswered };
    }
    case 'week_bookings': {
      const capacity = week.reduce((sum, row) => sum + row.capacity, 0);
      if (capacity === 0) return null;
      return { id, sold: week.reduce((sum, row) => sum + row.sold, 0), capacity };
    }
    case 'plan_seal': {
      const names = new Map(establishments.map((item) => [item.id, item.name]));
      const next = view.plans
        .filter((plan): plan is { itemId: string; until: string } =>
          Boolean(plan.until && names.has(plan.itemId))
        )
        .sort((a, b) => a.until.localeCompare(b.until))[0];
      return next ? { id, name: names.get(next.itemId) ?? '', until: next.until } : null;
    }
    case 'week_occupancy': {
      const days = weekDays(week);
      return days.length > 0 ? { id, days } : null;
    }
    case 'month_sales':
      return { id, ...view.numbers.month };
  }
}
