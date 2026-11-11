import type { OwnerOpenAbsence, OwnerSlotSummary } from '../../../domain/bookings';
import type { OwnerGuideItemSummary } from '../../../domain/guide';
import type { OwnerSalesDocument } from '../../../domain/partners';
import type { AccountDebtView, PayoutEntryView } from '../../../domain/payment';
import { businessDayStartMs } from '../../../shared/kernel/businessDay';
import type { PartnerPaymentAccount } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { sessionToAgendaItem, slotToAgendaItem } from './partnerAgendaItems';
import { sumMonthSales, summarizeWeek } from './partnerHomeCardsData';
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
  /** Cortesias que ocupam lugar (D27); fora do "vendidos". */
  courtesies: number;
  /** Convidados que já entraram (C7); zero antes de a portaria abrir. */
  courtesiesEntered: number;
}

export interface PartnerHomeInput {
  nowIso: string;
  /** Fuso do painel (D28): "Hoje", vendas do dia, semana e mês. */
  timeZone: string;
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
  const dayStart = businessDayStartMs(input.nowIso, input.timeZone);
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
    ...input.slots.filter((slot) => isToday(slot.startsAt)).map(slotToAgendaItem),
    ...input.sessions.filter((session) => isToday(session.startsAt)).map(sessionToAgendaItem),
  ].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  // Cartões de "Agora" (D27): o código vale até 12 h depois do fim (horários de ontem) e a lista
  // sem internet sai na véspera (horários de amanhã). O aparelho decide a hora de cada cartão.
  const inAgora = (iso: string) => {
    const ms = new Date(iso).getTime();
    return ms >= dayStart - DAY_MS && ms < dayEnd + DAY_MS;
  };
  const agora: PartnerTodayItem[] = [
    ...input.slots.filter((slot) => inAgora(slot.startsAt)).map(slotToAgendaItem),
    ...input.sessions.filter((session) => inAgora(session.startsAt)).map(sessionToAgendaItem),
  ].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const soldToday = input.recentEntries.filter(
    (entry) => entry.status !== 'canceled' && new Date(entry.createdAt).getTime() >= dayStart
  );
  const pending = input.openEntries.filter((entry) => entry.status === 'pending');
  const first = pending[0];
  const dayOf = (iso: string) => businessDayStartMs(iso, input.timeZone);
  const nextDay = first ? dayOf(first.releaseAt) : null;
  const sameDay = pending.filter((entry) => dayOf(entry.releaseAt) === nextDay);

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
      courtesies: session.courtesies,
    }));

  // Cartão Convidados (C7): sessões com cortesia, de ontem em diante; o aparelho escolhe pela hora.
  const guestSessions = input.sessions
    .filter((session) => session.courtesies > 0)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((session) => ({
      id: session.id,
      eventId: session.eventId,
      title: session.eventTitle,
      establishmentIds: session.establishmentId ? [session.establishmentId] : [],
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      courtesies: session.courtesies,
      entered: session.courtesiesEntered,
    }));

  return {
    guestSessions,
    cards: input.cards,
    timeZone: input.timeZone,
    establishments: input.establishments.map(
      ({ id, name, category, location, rating, reviewCount, timeZone }) => ({
        id,
        name,
        category,
        location,
        rating,
        reviewCount,
        unansweredReviews: input.unansweredReviews[id] ?? 0,
        ...(timeZone ? { timeZone } : {}),
      })
    ),
    attention,
    today,
    agora,
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
      month: sumMonthSales(input.recentEntries, input.nowIso, input.timeZone),
    },
    upcomingSessions,
    // Preenchido pelo caso de uso, que lê os divulgadores (ticketing).
    promoters: null,
    tour: { show: false, tipsOff: false },
    promoCodes: null,
    week: summarizeWeek(input.slots, input.nowIso, input.timeZone),
    plans: input.planUntil,
    summary: {
      documents: input.documents.length,
      pendingVerifications: input.verifications.filter((item) => item.status === 'pending').length,
    },
  };
}
