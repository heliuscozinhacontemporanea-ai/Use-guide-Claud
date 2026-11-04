import type { OwnerOpenAbsence, OwnerSlotSummary } from '../../../domain/bookings';
import type { OwnerGuideItemSummary } from '../../../domain/guide';
import type { OwnerSalesDocument } from '../../../domain/partners';
import type { AccountDebtView, PayoutEntryView } from '../../../domain/payment';
import { businessDayStartMs } from '../../../shared/kernel/businessDay';
import type { PartnerPaymentAccount } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { summarizeWeek, sumMonthSales } from './partnerHomeCardsData';
import type { PartnerAttentionItem, PartnerHomeView, PartnerTodayItem } from './partnerHomeTypes';

const DAY_MS = 24 * 60 * 60_000;
// Plano vencendo entra em "Resolva agora" na última semana.
const PLAN_WARNING_MS = 7 * DAY_MS;
export const UPCOMING_SESSIONS = 5;

export interface PartnerSessionInput {
  id: string;
  eventId: string;
  eventTitle: string;
  establishmentId: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number;
  sold: number;
}

export interface PartnerHomeInput {
  nowIso: string;
  cards: string[];
  establishments: OwnerGuideItemSummary[];
  unansweredReviews: Record<string, number>;
  documents: OwnerSalesDocument[];
  slots: OwnerSlotSummary[];
  openAbsences: OwnerOpenAbsence[];
  /** Sessões de hoje e as próximas (até 5), sem repetir. */
  sessions: PartnerSessionInput[];
  debts: AccountDebtView[];
  accounts: PartnerPaymentAccount[];
  verifications: Array<{ itemId: string; status: string }>;
  planUntil: Array<{ itemId: string; until: string | null }>;
  /** Extrato do mês corrente e do anterior, mais recentes primeiro. */
  recentEntries: PayoutEntryView[];
  openEntries: PayoutEntryView[];
}

/** Monta o Início a partir do que cada domínio devolveu; sem I/O, para testar as regras. */
export function buildPartnerHome(input: PartnerHomeInput): PartnerHomeView {
  const now = new Date(input.nowIso).getTime();
  const dayStart = businessDayStartMs(input.nowIso);
  const dayEnd = dayStart + DAY_MS;
  const names = new Map(input.establishments.map((item) => [item.id, item.name]));
  const itemsOf = (accountKey: string) =>
    input.documents.find((document) => document.accountKey === accountKey)?.itemIds ?? [];
  const nameOf = (ids: string[]) =>
    ids.map((id) => names.get(id)).find((name): name is string => Boolean(name)) ?? null;

  const attention: PartnerAttentionItem[] = [];
  for (const absence of input.openAbsences) {
    attention.push({
      kind: 'provider_absence',
      refId: absence.bookingId,
      establishmentIds: [absence.guideItemId],
      title: absence.title['pt-BR'],
      deadline: absence.respondBy,
    });
  }
  for (const entry of input.openEntries) {
    if (!entry.holdReasons.includes('claim')) continue;
    attention.push({
      kind: 'sale_claim',
      refId: entry.id,
      establishmentIds: itemsOf(entry.accountKey),
      title: entry.title,
      deadline: null,
      amountMinor: entry.partnerAmountMinor,
    });
  }
  for (const debt of input.debts) {
    if (debt.status !== 'open' || debt.remainingMinor <= 0) continue;
    const ids = itemsOf(debt.accountKey);
    attention.push({
      kind: 'debt',
      refId: debt.id,
      establishmentIds: ids,
      title: nameOf(ids),
      deadline: debt.dueAt,
      amountMinor: debt.remainingMinor,
    });
  }
  for (const account of input.accounts) {
    const ready = account.account?.readyForSales && account.account.requirementsDueCount === 0;
    if (ready) continue;
    attention.push({
      kind: 'payment_account',
      refId: account.accountKey,
      establishmentIds: account.itemIds,
      title: nameOf(account.itemIds),
      deadline: null,
    });
  }
  for (const verification of input.verifications) {
    if (verification.status !== 'rejected') continue;
    attention.push({
      kind: 'verification_rejected',
      refId: verification.itemId,
      establishmentIds: [verification.itemId],
      title: names.get(verification.itemId) ?? null,
      deadline: null,
    });
  }
  for (const plan of input.planUntil) {
    if (!plan.until) continue;
    const until = new Date(plan.until).getTime();
    if (until <= now || until - now > PLAN_WARNING_MS) continue;
    attention.push({
      kind: 'plan_expiring',
      refId: plan.itemId,
      establishmentIds: [plan.itemId],
      title: names.get(plan.itemId) ?? null,
      deadline: plan.until,
    });
  }
  // Com prazo primeiro, do mais próximo; sem prazo depois.
  attention.sort((a, b) =>
    a.deadline && b.deadline
      ? a.deadline.localeCompare(b.deadline)
      : a.deadline
        ? -1
        : b.deadline
          ? 1
          : 0
  );

  const isToday = (iso: string) => {
    const ms = new Date(iso).getTime();
    return ms >= dayStart && ms < dayEnd;
  };
  const today: PartnerTodayItem[] = [
    ...input.slots
      .filter((slot) => isToday(slot.startsAt))
      .map(
        (slot): PartnerTodayItem => ({
          kind: 'slot',
          id: slot.slotId,
          parentId: slot.offerId,
          establishmentIds: [slot.guideItemId],
          title: slot.title['pt-BR'],
          offerKind: slot.kind,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt ?? null,
          sold: slot.unitsCount,
          capacity: slot.capacityTotal,
          checkedIn: slot.checkedInUnits,
          arrivedAt: slot.arrivedAt ?? null,
        })
      ),
    ...input.sessions
      .filter((session) => isToday(session.startsAt))
      .map(
        (session): PartnerTodayItem => ({
          kind: 'session',
          id: session.id,
          parentId: session.eventId,
          establishmentIds: session.establishmentId ? [session.establishmentId] : [],
          title: session.eventTitle,
          startsAt: session.startsAt,
          endsAt: session.endsAt,
          sold: session.sold,
          capacity: session.capacity,
          checkedIn: null,
          arrivedAt: null,
        })
      ),
  ].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const soldToday = input.recentEntries.filter(
    (entry) => entry.status !== 'canceled' && new Date(entry.createdAt).getTime() >= dayStart
  );
  const pending = input.openEntries.filter((entry) => entry.status === 'pending');
  const first = pending[0];
  const nextDay = first ? businessDayStartMs(first.releaseAt) : null;
  const sameDay = pending.filter((entry) => businessDayStartMs(entry.releaseAt) === nextDay);

  const upcomingSessions = input.sessions
    .filter((session) => new Date(session.startsAt).getTime() >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, UPCOMING_SESSIONS)
    .map((session) => ({
      id: session.id,
      eventId: session.eventId,
      title: session.eventTitle,
      establishmentIds: session.establishmentId ? [session.establishmentId] : [],
      startsAt: session.startsAt,
      sold: session.sold,
      capacity: session.capacity,
    }));

  return {
    cards: input.cards,
    establishments: input.establishments.map(
      ({ id, name, category, location, rating, reviewCount }) => ({
        id,
        name,
        category,
        location,
        rating,
        reviewCount,
        unansweredReviews: input.unansweredReviews[id] ?? 0,
      })
    ),
    attention,
    today,
    numbers: {
      salesTodayMinor: soldToday.reduce((sum, entry) => sum + entry.grossMinor, 0),
      salesTodayCount: soldToday.length,
      nextPayout: first
        ? {
            releaseAt: first.releaseAt,
            amountMinor: sameDay.reduce((sum, entry) => sum + entry.partnerAmountMinor, 0),
            count: sameDay.length,
            accounts: new Set(sameDay.map((entry) => entry.accountKey)).size,
          }
        : null,
      month: sumMonthSales(input.recentEntries, input.nowIso),
    },
    upcomingSessions,
    week: summarizeWeek(input.slots, input.nowIso),
    plans: input.planUntil,
    summary: {
      documents: input.documents.length,
      pendingVerifications: input.verifications.filter((item) => item.status === 'pending').length,
    },
  };
}
