import { listOwnerAgendaUseCase } from '../../../domain/bookings';
import { listEventOccurrencesUseCase, listOwnerEventListingsUseCase } from '../../../domain/events';
import { listOwnerGuideItemsUseCase } from '../../../domain/guide';
import {
  getListingPlanUntilUseCase,
  listOwnerSalesDocumentsUseCase,
  listOwnerVerificationStatusesUseCase,
} from '../../../domain/partners';
import {
  listAccountDebtsUseCase,
  listOpenPayoutEntriesUseCase,
  listPayoutEntriesUseCase,
} from '../../../domain/payment';
import { businessDayStartMs } from '../../../shared/kernel/businessDay';
import { getCommittedTicketsCountForOccurrenceApplicationUseCase } from '../getCommittedTicketsCountForOccurrenceApplicationUseCase';
import { listPartnerPaymentAccountsApplicationUseCase } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { buildPartnerHome, type PartnerSessionInput } from './buildPartnerHome';
import type { PartnerHomeView } from './partnerHomeTypes';

const DAY_MS = 24 * 60 * 60_000;
// Ausência relatada ontem à noite ainda pode estar no prazo de 2 h de resposta.
const ABSENCE_LOOKBACK_MS = DAY_MS;
// Basta a primeira página do extrato para somar as vendas do dia.
const RECENT_ENTRIES = 100;
const OPEN_ENTRIES = 100;

/** Início do painel do parceiro (D27): "Resolva agora", "Hoje" e números, de todos os estabelecimentos. */
export async function getPartnerHomeApplicationUseCase(
  ownerUid: string,
  now: Date = new Date()
): Promise<PartnerHomeView> {
  const nowIso = now.toISOString();
  const dayStart = businessDayStartMs(nowIso);
  const fromIso = new Date(dayStart - ABSENCE_LOOKBACK_MS).toISOString();
  const toIso = new Date(dayStart + DAY_MS).toISOString();
  const actor = { uid: ownerUid, admin: false };

  const [establishments, documents, agenda, events, accounts, verifications] = await Promise.all([
    listOwnerGuideItemsUseCase(ownerUid),
    listOwnerSalesDocumentsUseCase(ownerUid),
    listOwnerAgendaUseCase(actor, fromIso, toIso),
    listOwnerEventListingsUseCase(ownerUid),
    listPartnerPaymentAccountsApplicationUseCase(ownerUid),
    listOwnerVerificationStatusesUseCase(ownerUid),
  ]);
  const accountKeys = documents.map((document) => document.accountKey);

  const [debts, recent, openEntries, planUntil, sessions] = await Promise.all([
    listAccountDebtsUseCase(accountKeys),
    listPayoutEntriesUseCase(accountKeys, RECENT_ENTRIES),
    listOpenPayoutEntriesUseCase(accountKeys, OPEN_ENTRIES),
    Promise.all(
      establishments.map(async (item) => ({
        itemId: item.id,
        until: await getListingPlanUntilUseCase(item.id),
      }))
    ),
    loadTodaySessions(ownerUid, events, dayStart),
  ]);

  return buildPartnerHome({
    nowIso,
    establishments,
    documents,
    slots: agenda.slots,
    openAbsences: agenda.openAbsences,
    sessions,
    debts,
    accounts,
    verifications,
    planUntil,
    recentEntries: recent.data,
    openEntries,
  });
}

async function loadTodaySessions(
  ownerUid: string,
  events: Awaited<ReturnType<typeof listOwnerEventListingsUseCase>>,
  dayStart: number
): Promise<PartnerSessionInput[]> {
  const perEvent = await Promise.all(
    events.map(async (event) => {
      const occurrences = await listEventOccurrencesUseCase(event.id);
      const today = occurrences.filter((occurrence) => {
        const ms = new Date(occurrence.startsAt).getTime();
        return occurrence.status !== 'canceled' && ms >= dayStart && ms < dayStart + DAY_MS;
      });
      return Promise.all(
        today.map(
          async (occurrence): Promise<PartnerSessionInput> => ({
            id: occurrence.id,
            eventId: event.id,
            eventTitle: event.title || event.name,
            establishmentId: event.establishmentId ?? null,
            startsAt: occurrence.startsAt,
            endsAt: occurrence.endsAt ?? null,
            capacity: occurrence.capacity,
            sold: await getCommittedTicketsCountForOccurrenceApplicationUseCase(
              { uid: ownerUid, admin: false, role: 'partner' },
              occurrence.id
            ),
          })
        )
      );
    })
  );
  return perEvent.flat();
}
