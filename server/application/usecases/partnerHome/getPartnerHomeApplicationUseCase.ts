import {
  type BookableOffer,
  isFleetOffer,
  listFleetDaysForPartnerUseCase,
  listOfferSlotsForPartnerUseCase,
  listOwnerAgendaUseCase,
  listPartnerOffersUseCase,
} from '../../../domain/bookings';
import { listOwnerEventListingsUseCase } from '../../../domain/events';
import { listOwnerGuideItemsUseCase } from '../../../domain/guide';
import {
  getListingPlanUntilUseCase,
  getPartnerHomeCardsUseCase,
  getPartnerPanelTourUseCase,
  listOwnerSalesDocumentsUseCase,
  listOwnerVerificationStatusesUseCase,
  shouldShowPanelTour,
} from '../../../domain/partners';
import {
  listAccountDebtsUseCase,
  listOpenPayoutEntriesUseCase,
  listPayoutEntriesUseCase,
  type PayoutEntryView,
} from '../../../domain/payment';
import { summarizeOwnerPromoCodesUseCase } from '../../../domain/promotions';
import { countUnansweredReviewsUseCase } from '../../../domain/reviews';
import { getEventPromotersUseCase } from '../../../domain/ticketing';
import { businessDayStartMs } from '../../../shared/kernel/businessDay';
import { hasCurrentPartnerTerms } from '../partnerTermsStatus';
import { listPartnerPaymentAccountsApplicationUseCase } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { buildFirstSteps } from './buildFirstSteps';
import { buildPartnerHome, UPCOMING_SESSIONS } from './buildPartnerHome';
import { panelTimeZone } from './panelTimeZone';
import { businessMonthStarts } from './partnerHomeCardsData';
import type {
  PartnerHomePromoters,
  PartnerHomeView,
  PartnerSessionInput,
} from './partnerHomeTypes';
import { listOwnerOccurrences, type OwnerEvent, toSessionInput } from './partnerSessions';

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
  // O fuso do painel só se sabe com os estabelecimentos: a agenda é lida com folga de um dia para
  // cobrir de UTC−2 a UTC−5, e o recorte de "Hoje" é feito no buildPartnerHome.
  const platformDayStart = businessDayStartMs(nowIso);
  const actor = { uid: ownerUid, admin: false };

  const [establishments, documents, agenda, events, accounts, verifications, cards] =
    await Promise.all([
      listOwnerGuideItemsUseCase(ownerUid),
      listOwnerSalesDocumentsUseCase(ownerUid),
      listOwnerAgendaUseCase(
        actor,
        new Date(platformDayStart - ABSENCE_LOOKBACK_MS - DAY_MS).toISOString(),
        new Date(platformDayStart + WEEK_MS + DAY_MS).toISOString(),
        new Date(platformDayStart + 2 * DAY_MS).toISOString()
      ),
      listOwnerEventListingsUseCase(ownerUid),
      listPartnerPaymentAccountsApplicationUseCase(ownerUid),
      listOwnerVerificationStatusesUseCase(ownerUid),
      getPartnerHomeCardsUseCase(ownerUid),
    ]);
  const accountKeys = documents.map((document) => document.accountKey);
  const timeZone = panelTimeZone(establishments);
  const dayStart = businessDayStartMs(nowIso, timeZone);

  const [debts, recentEntries, openEntries, planUntil, sessions, unansweredReviews] =
    await Promise.all([
      listAccountDebtsUseCase(accountKeys),
      loadTwoMonthsOfEntries(accountKeys, businessMonthStarts(nowIso, timeZone).previous),
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

  const view = buildPartnerHome({
    nowIso,
    timeZone,
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
  const [promoters, termsOk, tour, promoCodes, offers] = await Promise.all([
    loadNextPromoters(ownerUid, view.upcomingSessions),
    hasCurrentPartnerTerms(ownerUid),
    getPartnerPanelTourUseCase(ownerUid).catch(() => null),
    // O cartão é opcional: sem leitura dos cupons, ele só não aparece.
    summarizeOwnerPromoCodesUseCase(ownerUid).catch(() => null),
    listPartnerOffersUseCase(actor),
  ]);
  const firstSteps = buildFirstSteps({
    establishments,
    verifications,
    accounts,
    offers,
    offersWithSlots: await loadOffersWithSlots(actor, offers, agenda.slots, now),
    events: events.filter((event) => event.status !== 'archived'),
  });
  // Termos novos sem aceite: pedido no topo de "Resolva agora", sem parar as vendas.
  const attention =
    termsOk || accounts.length === 0
      ? view.attention
      : [
          {
            kind: 'partner_terms' as const,
            refId: 'partner_terms',
            establishmentIds: [],
            title: null,
            deadline: null,
          },
          ...view.attention,
        ];
  return {
    ...view,
    attention,
    firstSteps,
    promoters,
    promoCodes,
    // Sem leitura do estado, o tour não abre: melhor não mostrar que mostrar de novo a quem já viu.
    tour: tour
      ? { show: shouldShowPanelTour(tour), tipsOff: tour.tipsOff }
      : { show: false, tipsOff: false },
  };
}

// O passo "Horários" do guia (D34) olha a agenda já lida e, só para as ofertas sem horário nela, os
// próximos dois meses de poucas ofertas. Aluguel e translado privativo contam os dias abertos (F3b).
const SLOTS_LOOKAHEAD_MS = 60 * DAY_MS;
const OFFERS_CHECKED_FOR_SLOTS = 5;
const KINDS_WITH_SLOTS_STEP = new Set(['tour', 'rental', 'transfer']);

async function loadOffersWithSlots(
  actor: { uid: string; admin: boolean },
  offers: ReadonlyArray<Pick<BookableOffer, 'id' | 'kind' | 'sellingUnit'>>,
  agendaSlots: ReadonlyArray<{ offerId: string; status: string; startsAt: string }>,
  now: Date
): Promise<Set<string>> {
  const nowIso = now.toISOString();
  const withSlots = new Set(
    agendaSlots
      .filter((slot) => slot.status === 'open' && slot.startsAt >= nowIso)
      .map((slot) => slot.offerId)
  );
  const unknown = offers
    .filter((offer) => KINDS_WITH_SLOTS_STEP.has(offer.kind) && !withSlots.has(offer.id))
    .slice(0, OFFERS_CHECKED_FOR_SLOTS);
  const until = new Date(now.getTime() + SLOTS_LOOKAHEAD_MS).toISOString();
  await Promise.all(
    unknown.map(async (offer) => {
      if (isFleetOffer(offer)) {
        const days = await listFleetDaysForPartnerUseCase(
          actor,
          offer.id,
          nowIso.slice(0, 10),
          until.slice(0, 10)
        ).catch(() => []);
        if (days.some((day) => day.vehicles > 0)) withSlots.add(offer.id);
        return;
      }
      const slots = await listOfferSlotsForPartnerUseCase(actor, offer.id, nowIso, until).catch(
        () => []
      );
      if (slots.some((slot) => slot.status === 'open')) withSlots.add(offer.id);
    })
  );
  return withSlots;
}

// Poucos eventos por abertura: o cartão olha só os próximos, na ordem das sessões.
const PROMOTER_EVENTS_CHECKED = 3;

async function loadNextPromoters(
  ownerUid: string,
  sessions: PartnerHomeView['upcomingSessions']
): Promise<PartnerHomePromoters | null> {
  const events = [...new Map(sessions.map((session) => [session.eventId, session])).values()];
  for (const session of events.slice(0, PROMOTER_EVENTS_CHECKED)) {
    const summary = await getEventPromotersUseCase(
      { uid: ownerUid, admin: false, role: 'partner' },
      session.eventId
    ).catch(() => null);
    const rows = summary?.rows.filter((row) => row.status !== 'invited') ?? [];
    if (!summary || rows.length === 0) continue;
    return {
      eventId: session.eventId,
      title: session.title,
      establishmentIds: session.establishmentIds,
      owedMinor: summary.owedMinor,
      top: rows.slice(0, 3).map((row) => ({
        username: row.promoter.username,
        tickets: row.tickets,
        owedMinor: row.owedMinor,
      })),
    };
  }
  return null;
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

/** Sessões de ontem (resumo dos convidados, C7), de hoje e as próximas, com o vendido lido só delas. */
async function loadSessions(
  ownerUid: string,
  events: OwnerEvent[],
  dayStart: number,
  nowMs: number
): Promise<PartnerSessionInput[]> {
  const all = await listOwnerOccurrences(events);
  const today = all.filter(({ occurrence }) => {
    const ms = new Date(occurrence.startsAt).getTime();
    return ms >= dayStart - DAY_MS && ms < dayStart + DAY_MS;
  });
  const upcoming = all
    .filter(({ occurrence }) => new Date(occurrence.startsAt).getTime() >= nowMs)
    .sort((a, b) => a.occurrence.startsAt.localeCompare(b.occurrence.startsAt))
    .slice(0, UPCOMING_SESSIONS);
  const chosen = new Map([...today, ...upcoming].map((row) => [row.occurrence.id, row]));
  return Promise.all([...chosen.values()].map((row) => toSessionInput(ownerUid, row, nowMs)));
}
