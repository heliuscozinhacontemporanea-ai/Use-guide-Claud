import { listOwnerAgendaUseCase } from '../../../domain/bookings';
import { listOwnerEventListingsUseCase } from '../../../domain/events';
import { listOwnerGuideItemsUseCase } from '../../../domain/guide';
import {
  getListingPlanUntilUseCase,
  getPartnerHomeCardsUseCase,
  listOwnerSalesDocumentsUseCase,
  listOwnerVerificationStatusesUseCase,
} from '../../../domain/partners';
import {
  listAccountDebtsUseCase,
  listOpenPayoutEntriesUseCase,
  listPayoutEntriesUseCase,
  type PayoutEntryView,
} from '../../../domain/payment';
import { countUnansweredReviewsUseCase } from '../../../domain/reviews';
import { businessDayStartMs } from '../../../shared/kernel/businessDay';
import { listPartnerPaymentAccountsApplicationUseCase } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { buildPartnerHome, type PartnerSessionInput, UPCOMING_SESSIONS } from './buildPartnerHome';
import { businessMonthStarts } from './partnerHomeCardsData';
import { listOwnerOccurrences, type OwnerEvent, toSessionInput } from './partnerSessions';
import type { PartnerHomeView } from './partnerHomeTypes';

const DAY_MS = 24 * 60 * 60_000;
// Ausência relatada ontem à noite ainda pode estar no prazo de 2 h de resposta.
const ABSENCE_LOOKBACK_MS = DAY_MS;
const WEEK_MS = 7 * DAY_MS;
const PAGE = 100;
// Teto do extrato lido para somar dois meses; acima disso o cartão do mês fica aproximado.
const MAX_PAGES = 5;
const OPEN_ENTRIES = 100;

/** Início do painel do parceiro (D27): "Resolva agora", "Hoje", números e os dados dos cartões. */
export async function getPartnerHomeApplicationUseCase(
  ownerUid: string,
  now: Date = new Date()
): Promise<PartnerHomeView> {
  const nowIso = now.toISOString();
  const dayStart = businessDayStartMs(nowIso);
  const actor = { uid: ownerUid, admin: false };

  const [establishments, documents, agenda, events, accounts, verifications, cards] =
    await Promise.all([
      listOwnerGuideItemsUseCase(ownerUid),
      listOwnerSalesDocumentsUseCase(ownerUid),
      listOwnerAgendaUseCase(
        actor,
        new Date(dayStart - ABSENCE_LOOKBACK_MS).toISOString(),
        new Date(dayStart + WEEK_MS).toISOString(),
        new Date(dayStart + DAY_MS).toISOString()
      ),
      listOwnerEventListingsUseCase(ownerUid),
      listPartnerPaymentAccountsApplicationUseCase(ownerUid),
      listOwnerVerificationStatusesUseCase(ownerUid),
      getPartnerHomeCardsUseCase(ownerUid),
    ]);
  const accountKeys = documents.map((document) => document.accountKey);

  const [debts, recentEntries, openEntries, planUntil, sessions, unansweredReviews] =
    await Promise.all([
      listAccountDebtsUseCase(accountKeys),
      loadTwoMonthsOfEntries(accountKeys, businessMonthStarts(nowIso).previous),
      listOpenPayoutEntriesUseCase(accountKeys, OPEN_ENTRIES),
      Promise.all(
        establishments.map(async (item) => ({
          itemId: item.id,
          until: await getListingPlanUntilUseCase(item.id),
        }))
      ),
      loadSessions(ownerUid, events, dayStart, now.getTime()),
      // Só os itens do próprio dono: a lista vem de `listOwnerGuideItemsUseCase`.
      countUnansweredReviewsUseCase(establishments.map((item) => item.id)),
    ]);

  return buildPartnerHome({
    nowIso,
    cards,
    establishments,
    unansweredReviews,
    documents,
    slots: agenda.slots,
    openAbsences: agenda.openAbsences,
    sessions,
    debts,
    accounts,
    verifications,
    planUntil,
    recentEntries,
    openEntries,
  });
}

async function loadTwoMonthsOfEntries(
  accountKeys: string[],
  sinceMs: number
): Promise<PayoutEntryView[]> {
  const entries: PayoutEntryView[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await listPayoutEntriesUseCase(accountKeys, PAGE, cursor);
    entries.push(...result.data);
    const last = result.data[result.data.length - 1];
    if (!result.nextCursor || !last || new Date(last.createdAt).getTime() < sinceMs) break;
    cursor = result.nextCursor;
  }
  return entries;
}

/** Sessões de hoje e as próximas, com o vendido lido só delas. */
async function loadSessions(
  ownerUid: string,
  events: OwnerEvent[],
  dayStart: number,
  nowMs: number
): Promise<PartnerSessionInput[]> {
  const all = await listOwnerOccurrences(events);
  const today = all.filter(({ occurrence }) => {
    const ms = new Date(occurrence.startsAt).getTime();
    return ms >= dayStart && ms < dayStart + DAY_MS;
  });
  const upcoming = all
    .filter(({ occurrence }) => new Date(occurrence.startsAt).getTime() >= nowMs)
    .sort((a, b) => a.occurrence.startsAt.localeCompare(b.occurrence.startsAt))
    .slice(0, UPCOMING_SESSIONS);
  const chosen = new Map([...today, ...upcoming].map((row) => [row.occurrence.id, row]));
  return Promise.all([...chosen.values()].map((row) => toSessionInput(ownerUid, row)));
}
