import { listOwnerAgendaUseCase } from '../../../domain/bookings';
import { listOwnerEventListingsUseCase } from '../../../domain/events';
import { sessionToAgendaItem, slotToAgendaItem } from './partnerAgendaItems';
import type { PartnerTodayItem } from './partnerHomeTypes';
import { listOwnerOccurrences, toSessionInput } from './partnerSessions';

// Acima de uma semana (o calendário do mês), só os contadores do horário: sem ler cada reserva.
const DETAIL_MAX_MS = 8 * 24 * 60 * 60_000;

/** Horários de reserva e sessões do dono em [fromIso, toIso), em ordem de horário (Agenda, p05). */
export async function getPartnerAgendaApplicationUseCase(
  ownerUid: string,
  fromIso: string,
  toIso: string
): Promise<PartnerTodayItem[]> {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  const detailUntil = to - from <= DETAIL_MAX_MS ? toIso : fromIso;
  const [agenda, events] = await Promise.all([
    listOwnerAgendaUseCase({ uid: ownerUid, admin: false }, fromIso, toIso, detailUntil),
    listOwnerEventListingsUseCase(ownerUid),
  ]);
  const occurrences = (await listOwnerOccurrences(events)).filter(({ occurrence }) => {
    const ms = new Date(occurrence.startsAt).getTime();
    return ms >= from && ms < to;
  });
  const sessions = await Promise.all(occurrences.map((row) => toSessionInput(ownerUid, row)));
  return [
    ...agenda.slots
      .filter((slot) => new Date(slot.startsAt).getTime() >= from)
      .map(slotToAgendaItem),
    ...sessions.map(sessionToAgendaItem),
  ].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
